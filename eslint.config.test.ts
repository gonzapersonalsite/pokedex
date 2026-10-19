// @vitest-environment node
import { lstatSync, mkdtempSync, readFileSync, rmdirSync, symlinkSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, posix } from 'node:path'
import { ESLint, type Linter } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'
import type { TestProjectConfiguration } from 'vitest/config'
import viteConfig from './vite.config.ts'

// Each architecture rule of eslint.config.js, seen firing on the smallest file
// that breaks it, and seen silent on files that keep to it: relaxing a rule
// turns its case red here, not only in a review.
const eslint = new ESLint({ cwd: import.meta.dirname })

// The first lint loads eslint.config.js, its plugins and the parser: a cold start of
// seconds that would otherwise count against the first case's 5 s timeout.
beforeAll(async () => {
  await eslint.lintText('', { filePath: 'src/app/warmup.ts' })
}, 30_000)

async function lint(path: string, code: string): Promise<Linter.LintMessage[]> {
  const [result] = await eslint.lintText(code, { filePath: path })
  return result.messages
}

// The rule of a report, or its text when it has none (a parsing error, an ignored comment).
const ruleOf = (message: Linter.LintMessage): string => message.ruleId ?? message.message

// Errors only: a rule lowered to a warning no longer breaks the file, and its case turns red.
async function rulesBrokenBy(path: string, code: string): Promise<string[]> {
  const messages = await lint(path, code)
  return messages.filter((message) => message.severity === 2).map(ruleOf)
}

// Every report, warnings included: a warning is red too, so a file that keeps
// to the rules gets none.
async function reportsOn(path: string, code: string): Promise<string[]> {
  const messages = await lint(path, code)
  return messages.map(ruleOf)
}

describe('the layers of Feature-Sliced Design', () => {
  it.each([
    [
      'a layer importing from a layer above it',
      'src/entities/task/model/rank.ts',
      "import { AddTaskForm } from '@/features/add-task'\nexport const form = AddTaskForm\n",
      'fsd/forbidden-imports',
    ],
    [
      'a slice importing a sibling of its own layer',
      'src/features/add-task/model/rename.ts',
      "import { rename } from '@/features/rename-task'\nexport const again = rename\n",
      'fsd/no-cross-slice-dependency',
    ],
    [
      'a relative import that leaves its slice',
      'src/features/add-task/ui/Picker.tsx',
      "import { TaskItem } from '../../../entities/task'\nexport const Item = TaskItem\n",
      'fsd/no-relative-imports',
    ],
    [
      'a deep import into a slice',
      'src/pages/home/ui/Board.tsx',
      "import { addTask } from '@/entities/task/model/task'\nexport const add = addTask\n",
      'fsd/no-public-api-sidestep',
    ],
    [
      'an import of a segment instead of the slice',
      'src/pages/home/ui/Board.tsx',
      "import { addTask } from '@/entities/task/model'\nexport const add = addTask\n",
      'fsd/no-public-api-sidestep',
    ],
    [
      'a deep import into a feature',
      'src/pages/home/ui/Board.tsx',
      "import { AddTaskForm } from '@/features/add-task/ui/AddTaskForm'\nexport const Form = AddTaskForm\n",
      'fsd/no-public-api-sidestep',
    ],
    [
      'a deep import into a widget',
      'src/pages/home/ui/Board.tsx',
      "import { TaskBoard } from '@/widgets/task-board/ui/TaskBoard'\nexport const Board = TaskBoard\n",
      'fsd/no-public-api-sidestep',
    ],
    [
      'a deep import into a page',
      'src/app/Shell.tsx',
      "import { HomePage } from '@/pages/home/ui/HomePage'\nexport const Page = HomePage\n",
      'fsd/no-public-api-sidestep',
    ],
    [
      'a dynamic import of a sibling of its own layer',
      'src/features/add-task/model/lazy.ts',
      "export const load = () => import('@/features/rename-task')\n",
      'fsd/no-cross-slice-dependency',
    ],
    [
      'a dynamic relative import that leaves its slice',
      'src/features/add-task/ui/lazy.ts',
      "export const load = () => import('../../../entities/task')\n",
      'fsd/no-relative-imports',
    ],
    [
      'a dynamic deep import into a slice',
      'src/pages/home/ui/lazy.ts',
      "export const load = () => import('@/entities/task/model/task')\n",
      'fsd/no-public-api-sidestep',
    ],
    ['a folder of src that is not a layer', 'src/services/api.ts', 'export const api = 1\n', 'no-restricted-syntax'],
    [
      'a folder of src that is not a layer, re-exporting',
      'src/services/index.ts',
      "export { api } from './api'\n",
      'no-restricted-syntax',
    ],
    [
      'a file at the root of src',
      'src/utils.ts',
      'export const twice = (n: number) => n * 2\n',
      'no-restricted-syntax',
    ],
  ])('rejects %s', async (_case, path, code, rule) => {
    expect(await rulesBrokenBy(path, code)).toContain(rule)
  })

  it.each(['js', 'jsx', 'mjs', 'cjs', 'mts', 'cts'])(
    'rejects code in a .%s file, which none of the rules would read',
    async (extension) => {
      // A statement that every module system parses: a .cjs file rejects export.
      expect(await rulesBrokenBy(`src/entities/task/model/legacy.${extension}`, 'const legacy = 1\n')).toContain(
        'no-restricted-syntax',
      )
    },
  )

  it('accepts imports that go down the layers through each public API', async () => {
    const code =
      "import { TaskItem } from '@/entities/task'\nimport { AddTaskForm } from '@/features/add-task'\nimport { createHttpClient } from '@/shared/api'\nexport const parts = [TaskItem, AddTaskForm, createHttpClient]\n"

    expect(await reportsOn('src/pages/home/ui/Board.tsx', code)).toEqual([])
  })

  it('accepts a scoped package whose name starts like a layer, which is not the alias', async () => {
    // Only '@/...' is the alias; '@app/tokens' is a package, not the app layer.
    const code = "import { tokens } from '@app/tokens'\nexport const theme = tokens\n"

    expect(await reportsOn('src/entities/task/model/rank.ts', code)).toEqual([])
  })

  it('leaves a test free of the import rules of the layers', async () => {
    // A layer above, a sibling slice, a deep import and a relative path out of the slice,
    // imported, re-exported, imported dynamically and globbed.
    const code =
      "import { AddTaskForm } from '@/features/add-task'\nimport { User } from '@/entities/user'\nimport { UserCard } from '@/entities/user/ui/UserCard'\nimport { Avatar } from '../../user'\nexport const parts = [AddTaskForm, User, UserCard, Avatar]\nexport { RenameForm } from '@/features/rename-task'\nexport { Badge } from '@/entities/user'\nexport { UserRow } from '@/entities/user/ui/UserRow'\nexport { Initials } from '../../user/lib/initials'\nexport const load = () => import('@/features/rename-task')\nexport const pages = import.meta.glob('../../../features/*/index.ts')\n"

    expect(await reportsOn('src/entities/task/model/task.extra.test.ts', code)).toEqual([])
  })
})

// The checks of fsd-gaps/boundaries a file breaks: one local rule, a message per check.
async function gapChecksBrokenBy(path: string, code: string): Promise<string[]> {
  const messages = await lint(path, code)
  return messages
    .filter((message) => message.severity === 2 && message.ruleId === 'fsd-gaps/boundaries')
    .map((message) => message.messageId ?? message.message)
    .sort()
}

describe('the layers over what fsd-lint 1.2.1 does not read: re-exports, a dynamic import() and import.meta.glob', () => {
  it.each([
    [
      'a re-export from a layer above',
      'src/entities/task/model/rank.ts',
      "export { AddTaskForm } from '@/features/add-task'\n",
      ['reExportFromAbove'],
    ],
    [
      'a re-export of everything from a layer above',
      'src/entities/task/model/rank.ts',
      "export * from '@/features/add-task'\n",
      ['reExportFromAbove'],
    ],
    [
      'a relative re-export from a layer above',
      'src/entities/task/model/rank.ts',
      "export { AddTaskForm } from '../../../features/add-task'\n",
      ['reExportFromAbove', 'reExportOutOfSlice'],
    ],
    [
      'a re-export from a sibling of its own layer',
      'src/features/add-task/model/rename.ts',
      "export { rename } from '@/features/rename-task'\n",
      ['reExportFromSibling'],
    ],
    [
      'a relative re-export from a sibling of its own layer',
      'src/features/add-task/model/rename.ts',
      "export { rename } from '../../rename-task'\n",
      ['reExportFromSibling', 'reExportOutOfSlice'],
    ],
    [
      'a re-export of a segment instead of the slice',
      'src/pages/home/model/parts.ts',
      "export { addTask } from '@/entities/task/model'\n",
      ['reExportPastPublicApi'],
    ],
    [
      'a deep re-export from an entity',
      'src/pages/home/ui/Board.tsx',
      "export { addTask } from '@/entities/task/model/task'\n",
      ['reExportPastPublicApi'],
    ],
    [
      'a deep re-export from a feature',
      'src/pages/home/model/parts.ts',
      "export { AddTaskForm } from '@/features/add-task/ui/AddTaskForm'\n",
      ['reExportPastPublicApi'],
    ],
    [
      'a deep re-export from a widget',
      'src/pages/home/model/parts.ts',
      "export { TaskBoard } from '@/widgets/task-board/ui/TaskBoard'\n",
      ['reExportPastPublicApi'],
    ],
    [
      'a deep re-export from a page',
      'src/app/routes.ts',
      "export { HomePage } from '@/pages/home/ui/HomePage'\n",
      ['reExportPastPublicApi'],
    ],
    [
      'a relative re-export that leaves its slice',
      'src/features/add-task/model/parts.ts',
      "export { addTask } from '../../../entities/task/model/task'\n",
      ['reExportOutOfSlice'],
    ],
    [
      'a relative re-export that leaves src',
      'src/shared/config/build.ts',
      "export { default } from '../../../vite.config'\n",
      ['reExportOutOfSlice'],
    ],
    [
      'a dynamic import of a layer above',
      'src/entities/task/model/lazy.ts',
      "export const load = () => import('@/features/add-task')\n",
      ['dynamicImportFromAbove'],
    ],
    [
      'a dynamic relative import of a layer above',
      'src/entities/task/model/lazy.ts',
      "export const load = () => import('../../../features/add-task')\n",
      ['dynamicImportFromAbove'],
    ],
    [
      'a re-export from a layer above, after a doubled slash',
      'src/entities/task/model/rank.ts',
      "export { AddTaskForm } from '@//features/add-task'\n",
      ['reExportFromAbove'],
    ],
    [
      'a re-export from a layer above, through a dot segment',
      'src/shared/config/app.ts',
      "export * from '@/./app/main'\n",
      ['reExportFromAbove'],
    ],
    [
      'a re-export from a sibling, reached through another layer',
      'src/features/add-task/model/rename.ts',
      "export { rename } from '@/shared/../features/rename-task'\n",
      ['reExportFromSibling'],
    ],
    [
      'a dynamic import of a layer above, after a doubled slash',
      'src/entities/task/model/lazy.ts',
      "export const load = () => import('@//features/add-task')\n",
      ['dynamicImportFromAbove'],
    ],
    [
      'a deep re-export from a widget, after a doubled slash',
      'src/pages/home/model/parts.ts',
      "export { TaskBoard } from '@//widgets/task-board/ui/TaskBoard'\n",
      ['reExportPastPublicApi'],
    ],
    [
      'a re-export from a layer above, out of src and back in',
      'src/entities/task/model/rank.ts',
      "export { AddTaskForm } from '@/../src/features/add-task'\n",
      ['reExportFromAbove'],
    ],
    [
      'a dynamic relative import of a layer above, out of src and back in',
      'src/entities/task/model/lazy.ts',
      "export const load = () => import('../../../../src/features/add-task')\n",
      ['dynamicImportFromAbove'],
    ],
    [
      'a glob from the root of the project',
      'src/entities/task/model/pages.ts',
      "export const pages = import.meta.glob('/src/pages/**/index.ts')\n",
      ['unreadableGlob'],
    ],
    [
      'a glob through the alias',
      'src/entities/task/model/app.ts',
      "export const app = import.meta.glob('@/app/*.tsx', { eager: true })\n",
      ['unreadableGlob'],
    ],
    [
      'a glob that climbs out of its folder',
      'src/entities/task/model/features.ts',
      "export const features = import.meta.glob('../../../features/*/index.ts')\n",
      ['unreadableGlob'],
    ],
    [
      'a glob that climbs out of its folder past a first segment',
      'src/entities/task/model/features.ts',
      "export const features = import.meta.glob('./../../../features/*/index.ts')\n",
      ['unreadableGlob'],
    ],
    [
      'a ".." inside braces, which the lint does not expand',
      'src/entities/task/model/features.ts',
      "export const features = import.meta.glob('./{..,model}/*.ts')\n",
      ['unreadableGlob'],
    ],
    [
      'a glob with a base of its own',
      'src/entities/task/model/features.ts',
      "export const features = import.meta.glob('./*/index.ts', { base: '../../../features' })\n",
      ['unreadableGlob'],
    ],
    [
      'a list of globs with one that climbs out',
      'src/shared/lib/modules.ts',
      "export const modules = import.meta.glob(['./parts/*.ts', '../../app/*.tsx'])\n",
      ['unreadableGlob'],
    ],
    [
      'a glob whose pattern is a template literal',
      'src/entities/task/model/parts.ts',
      'export const parts = import.meta.glob(`./parts/*.ts`)\n',
      ['unreadableGlob'],
    ],
    [
      'a glob whose pattern is a variable',
      'src/entities/task/model/parts.ts',
      "const pattern = './parts/*.ts'\nexport const parts = import.meta.glob(pattern)\n",
      ['unreadableGlob'],
    ],
    [
      'a glob whose options the lint cannot read',
      'src/entities/task/model/parts.ts',
      "const options = { base: '../../../features' }\nexport const parts = import.meta.glob('./*/index.ts', options)\n",
      ['unreadableGlob'],
    ],
  ])('rejects %s', async (_case, path, code, checks) => {
    expect(await gapChecksBrokenBy(path, code)).toEqual(checks)
  })

  it('accepts globs that stay inside the folder of their file', async () => {
    const code =
      "export const locales = import.meta.glob('./locales/*.json', { eager: true, import: 'default' })\nexport const parts = import.meta.glob(['./parts/*.ts', './more/**/*.ts'])\n"

    expect(await reportsOn('src/entities/task/model/parts.ts', code)).toEqual([])
  })

  it('leaves app, the top layer, free to glob any layer', async () => {
    const code = "export const pages = import.meta.glob('/src/pages/**/index.ts')\n"

    expect(await reportsOn('src/app/routes.ts', code)).toEqual([])
  })

  it('leaves to convention a file at the root of a layer with slices, whose folder holds every slice', async () => {
    // No rule refuses the file, and from there a glob inside its folder reaches the model of each entity, which
    // an import of one of them from the same file does not.
    const code = "export const models = import.meta.glob('./*/model/*.ts')\n"

    expect(await reportsOn('src/entities/registry.ts', code)).toEqual([])
  })

  it('accepts re-exports that go down the layers through each public API', async () => {
    // The public API named as fsd-lint takes it in an import: the folder, with or without
    // a trailing slash, or its index bare, with .ts or with the .js TypeScript resolves.
    const code =
      "export { TaskItem } from '@/entities/task'\nexport * from '@/features/add-task'\nexport { createHttpClient } from '@/shared/api'\nexport type { Task } from '@/entities/task/index'\nexport { useTaskList } from '@/entities/task/index.ts'\nexport { addTask } from '@/entities/task/index.js'\nexport { AddTaskForm } from '@/features/add-task/'\n"

    expect(await reportsOn('src/pages/home/model/parts.ts', code)).toEqual([])
  })

  it('accepts a re-export through a public API named with a doubled slash', async () => {
    // TypeScript resolves '@/widgets//task-board' to the slice itself.
    const code = "export { TaskBoard } from '@/widgets//task-board'\n"

    expect(await reportsOn('src/pages/home/model/parts.ts', code)).toEqual([])
  })

  it('leaves alone what the alias does not place in src: a scoped package and a path out of src', async () => {
    // '@app/tokens' is a package, not the alias, and '@/../app/config' resolves outside src.
    const code = "export { tokens } from '@app/tokens'\nexport { config } from '@/../app/config'\n"

    expect(await reportsOn('src/entities/task/model/rank.ts', code)).toEqual([])
  })

  it('accepts the index of a slice re-exporting its own segments', async () => {
    const code =
      "export type { Task } from './model/task'\nexport { useTaskList } from './model/useTaskList'\nexport { TaskItem } from './ui/TaskItem'\n"

    expect(await reportsOn('src/entities/task/index.ts', code)).toEqual([])
  })

  it('accepts relative re-exports between the segments of a layer without slices', async () => {
    expect(await reportsOn('src/shared/lib/index.ts', "export { createHttpClient } from '../api'\n")).toEqual([])
  })

  it('leaves to convention a re-export into its own slice through the alias', async () => {
    // A cycle the lint does not see, as an import of its own slice through the alias.
    const code = "export { addTask } from '@/entities/task/model/task'\n"

    expect(await reportsOn('src/entities/task/index.ts', code)).toEqual([])
  })

  it('accepts a dynamic import down the layers and inside its slice', async () => {
    const code =
      "export const loadForm = () => import('@/features/add-task')\nexport const loadPage = () => import('./HomePage')\n"

    expect(await reportsOn('src/pages/home/ui/lazy.ts', code)).toEqual([])
  })

  it('leaves alone a dynamic import whose path is computed, which no rule can read', async () => {
    const code = 'export const load = (module: string) => import(module)\n'

    expect(await reportsOn('src/shared/lib/load.ts', code)).toEqual([])
  })

  // Left to convention: every rule reads the path of an import() only when it is a string literal, and none
  // reads a type that imports. A rule that starts reading them turns its case red, and the convention goes.
  it.each([
    [
      'a dynamic import of a layer above whose path is a template literal',
      'src/entities/task/model/lazy.ts',
      'export const load = () => import(`@/features/add-task`)\n',
    ],
    [
      'a dynamic import of a sibling slice whose path is a template literal',
      'src/features/add-task/model/lazy.ts',
      'export const load = () => import(`@/features/rename-task`)\n',
    ],
    [
      'a type that imports a layer above, with typeof import()',
      'src/entities/task/model/form.ts',
      "export type Form = typeof import('@/features/add-task')\n",
    ],
    [
      'a type that imports a layer above, with import().Type',
      'src/shared/lib/task.ts',
      "export type Item = import('@/entities/task').Task\n",
    ],
  ])('leaves to convention %s, which no rule reads', async (_case, path, code) => {
    expect(await reportsOn(path, code)).toEqual([])
  })

  it('holds in a project reached through a link or a junction', async () => {
    // Node loads eslint.config.js by its real path, and ESLint names a file by the path it reached it by.
    const folder = mkdtempSync(join(tmpdir(), 'fsd-gaps-'))
    const project = join(folder, 'project')
    try {
      symlinkSync(import.meta.dirname, project, 'junction')
      const throughLink = new ESLint({ cwd: project })
      const [result] = await throughLink.lintText("export * from '@/app/main'\n", { filePath: 'src/shared/api/up.ts' })

      expect(result.messages.map((message) => message.messageId)).toEqual(['reExportFromAbove'])
    } finally {
      // unlink removes the link itself, never what it points to.
      if (lstatSync(project, { throwIfNoEntry: false })) unlinkSync(project)
      rmdirSync(folder)
    }
  })
})

// The one exception of Feature-Sliced Design to slices that do not import each other: an entity B
// exposes to an entity A what A needs of it in B/@x/A.ts, and only A imports it, as @/entities/B/@x/A.
describe('the cross-imports of entities through @x', () => {
  it('accepts an entity importing what another entity exposes to it in @x', async () => {
    const code =
      "import type { User } from '@/entities/user/@x/task'\nexport type Owner = User\nexport const load = () => import('@/entities/user/@x/task')\n"

    expect(await reportsOn('src/entities/task/model/task.ts', code)).toEqual([])
  })

  it('accepts the @x file re-exporting its own slice', async () => {
    expect(await reportsOn('src/entities/user/@x/task.ts', "export type { User } from '../model/user'\n")).toEqual([])
  })

  it.each([
    [
      'another entity than the one it is exposed to',
      'src/entities/comment/model/comment.ts',
      "import type { User } from '@/entities/user/@x/task'\nexport type Author = User\n",
      'fsd/no-cross-slice-dependency',
    ],
    [
      'a slice of another layer',
      'src/features/add-task/model/form.ts',
      "import type { User } from '@/entities/user/@x/add-task'\nexport type Owner = User\n",
      'fsd/no-public-api-sidestep',
    ],
    [
      'a relative path to the @x file',
      'src/entities/task/model/task.ts',
      "import type { User } from '../../user/@x/task'\nexport type Owner = User\n",
      'fsd/no-relative-imports',
    ],
    [
      'an @x between slices of a layer that is not entities',
      'src/features/rename-task/model/form.ts',
      "import type { Form } from '@/features/add-task/@x/rename-task'\nexport type Draft = Form\n",
      'fsd/no-cross-slice-dependency',
    ],
  ])('rejects an @x import from %s', async (_case, path, code, rule) => {
    expect(await rulesBrokenBy(path, code)).toContain(rule)
  })

  it('rejects re-exporting the @x of another entity, which would hand it to every consumer of the slice', async () => {
    const code = "export type { User } from '@/entities/user/@x/task'\n"

    expect(await gapChecksBrokenBy('src/entities/task/model/task.ts', code)).toEqual([
      'reExportFromSibling',
      'reExportPastPublicApi',
    ])
  })

  it('leaves to convention a path past the @x file, which fsd-lint accepts', async () => {
    // fsd-lint reads the slice of the consumer from the segment after @x and nothing below it.
    const code = "import type { User } from '@/entities/user/@x/task/model'\nexport type Owner = User\n"

    expect(await reportsOn('src/entities/task/model/task.ts', code)).toEqual([])
  })
})

describe('no UI in the model, api and lib segments', () => {
  it.each([
    ['a .tsx file', 'src/entities/task/model/view.tsx', 'export const view = 1\n', 'no-restricted-syntax'],
    [
      'an import of its slice ui',
      'src/features/add-task/model/form.ts',
      "import { AddTaskForm } from '../ui/AddTaskForm'\nexport const form = AddTaskForm\n",
      'no-restricted-imports',
    ],
    [
      'an import of the shared ui',
      'src/features/add-task/api/notify.ts',
      "import { Toast } from '@/shared/ui'\nexport const toast = Toast\n",
      'no-restricted-imports',
    ],
    [
      'an import of react-dom',
      'src/entities/task/model/portal.ts',
      "import { createPortal } from 'react-dom'\nexport const portal = createPortal\n",
      'no-restricted-imports',
    ],
    [
      'an import of react-dom/client',
      'src/entities/task/model/root.ts',
      "import { createRoot } from 'react-dom/client'\nexport const root = createRoot\n",
      'no-restricted-imports',
    ],
    [
      'an import of react-dom/server',
      'src/entities/task/model/html.ts',
      "import { renderToString } from 'react-dom/server'\nexport const html = renderToString\n",
      'no-restricted-imports',
    ],
    [
      'the JSX runtime',
      'src/entities/task/model/runtime.ts',
      "import { jsx } from 'react/jsx-runtime'\nexport const element = jsx('p', {})\n",
      'no-restricted-imports',
    ],
    [
      'the JSX dev runtime',
      'src/entities/task/model/runtime.ts',
      "import { jsxDEV } from 'react/jsx-dev-runtime'\nexport const element = jsxDEV\n",
      'no-restricted-imports',
    ],
    [
      'an element created without JSX',
      'src/entities/task/model/element.ts',
      "import { createElement } from 'react'\nexport const element = createElement('p')\n",
      'no-restricted-imports',
    ],
    [
      'an element cloned without JSX',
      'src/entities/task/lib/clone.ts',
      "import { cloneElement } from 'react'\nexport const clone = cloneElement\n",
      'no-restricted-imports',
    ],
    [
      'React as a default import',
      'src/entities/task/model/element.ts',
      "import React from 'react'\nexport const element = React.createElement('p')\n",
      'no-restricted-imports',
    ],
    [
      'React as a namespace',
      'src/entities/task/model/element.ts',
      "import * as React from 'react'\nexport const element = React.createElement('p')\n",
      'no-restricted-imports',
    ],
    [
      'a dynamic import of its slice ui',
      'src/features/add-task/model/lazy.ts',
      "export const load = () => import('../ui/AddTaskForm')\n",
      'no-restricted-syntax',
    ],
    [
      'a dynamic import of react-dom',
      'src/features/add-task/api/lazy.ts',
      "export const load = () => import('react-dom/client')\n",
      'no-restricted-syntax',
    ],
    [
      'a dynamic import of the JSX runtime',
      'src/features/add-task/lib/lazy.ts',
      "export const load = () => import('react/jsx-runtime')\n",
      'no-restricted-syntax',
    ],
    [
      'a dynamic import of styles',
      'src/features/add-task/lib/lazy.ts',
      "export const load = () => import('./theme.module.css')\n",
      'no-restricted-syntax',
    ],
    [
      'a dynamic import of React, which brings it as a whole',
      'src/entities/task/model/lazy.ts',
      "export const load = () => import('react')\n",
      'no-restricted-syntax',
    ],
  ])('rejects %s', async (_case, path, code, rule) => {
    expect(await rulesBrokenBy(path, code)).toContain(rule)
  })

  it.each(['css', 'scss', 'sass', 'less', 'styl', 'stylus', 'pcss', 'postcss', 'sss', 'css?inline'])(
    'rejects an import of .%s styles',
    async (extension) => {
      const code = `import styles from './theme.module.${extension}'\nexport const theme = styles\n`

      expect(await rulesBrokenBy('src/entities/task/lib/theme.ts', code)).toContain('no-restricted-imports')
    },
  )

  it('sees both the .tsx file and its dynamic import of UI', async () => {
    const broken = await rulesBrokenBy(
      'src/features/add-task/model/lazy.tsx',
      "export const load = () => import('../ui/AddTaskForm')\n",
    )

    expect(broken.filter((rule) => rule === 'no-restricted-syntax')).toHaveLength(2)
  })

  it('leaves to convention a dynamic import of UI whose path is a template literal, which no rule reads', async () => {
    const code = 'export const load = () => import(`../ui/AddTaskForm`)\n'

    expect(await reportsOn('src/features/add-task/model/lazy.ts', code)).toEqual([])
  })

  it('accepts logic that uses React state and its own model', async () => {
    const code =
      "import { useState } from 'react'\nimport { countPending } from './task'\nexport const parts = [useState, countPending]\n"

    expect(await reportsOn('src/entities/task/model/usePending.ts', code)).toEqual([])
  })

  it('leaves the tests of those segments free to render', async () => {
    const code =
      "import { render } from '@testing-library/react'\nimport { TaskItem } from '../ui/TaskItem'\nexport const draw = () => render(<TaskItem task={{ id: '1', title: 't', done: false }} onToggle={() => {}} onRemove={() => {}} />)\n"

    expect(await reportsOn('src/entities/task/model/task.view.test.tsx', code)).toEqual([])
  })
})

describe('the network only from src/shared/api', () => {
  it.each([
    ['fetch', "export const load = () => fetch('/tasks')\n", 'no-restricted-globals'],
    ['XMLHttpRequest', 'export const open = () => new XMLHttpRequest()\n', 'no-restricted-globals'],
    ['WebSocket', "export const open = () => new WebSocket('wss://tasks.example.test')\n", 'no-restricted-globals'],
    ['EventSource', "export const open = () => new EventSource('/tasks/events')\n", 'no-restricted-globals'],
    [
      'a constant read from WebSocket',
      'export const isOpen = (socket: { readyState: number }) => socket.readyState === WebSocket.OPEN\n',
      'no-restricted-globals',
    ],
    ['window.fetch', "export const load = () => window.fetch('/tasks')\n", 'no-restricted-properties'],
    ['globalThis.fetch', "export const load = () => globalThis.fetch('/tasks')\n", 'no-restricted-properties'],
    ['self.fetch', "export const load = () => self.fetch('/tasks')\n", 'no-restricted-properties'],
    ['window.XMLHttpRequest', 'export const open = () => new window.XMLHttpRequest()\n', 'no-restricted-properties'],
    [
      'globalThis.XMLHttpRequest',
      'export const open = () => new globalThis.XMLHttpRequest()\n',
      'no-restricted-properties',
    ],
    [
      'globalThis.WebSocket',
      "export const open = () => new globalThis.WebSocket('wss://tasks.example.test')\n",
      'no-restricted-properties',
    ],
    [
      'self.EventSource',
      "export const open = () => new self.EventSource('/tasks/events')\n",
      'no-restricted-properties',
    ],
    [
      'navigator.sendBeacon',
      "export const send = () => navigator.sendBeacon('/log', '')\n",
      'no-restricted-properties',
    ],
    [
      'window.navigator.sendBeacon',
      "export const send = () => window.navigator.sendBeacon('/log', '')\n",
      'no-restricted-properties',
    ],
    [
      'fetch taken out of window',
      'const { fetch: send } = window\nexport const load = send\n',
      'no-restricted-properties',
    ],
    ["window['fetch']", "export const load = () => window['fetch']('/tasks')\n", 'no-restricted-properties'],
  ])('rejects %s outside src/shared/api', async (_case, code, rule) => {
    expect(await rulesBrokenBy('src/entities/task/api/loadTasks.ts', code)).toContain(rule)
  })

  // ESLint puts the name it found in front of every message: the text after it is what tells them apart.
  it('sends a request to the HTTP client from an api segment', async () => {
    const [request] = await lint('src/entities/task/api/loadTasks.ts', "export const load = () => fetch('/tasks')\n")

    expect(request.message).toContain('call it from an api segment')
  })

  // A global, a property of a global object and one of any object: three kinds of entry, each with its message.
  it.each([
    ['new EventSource', "export const open = () => new EventSource('/tasks/events')\n"],
    ['globalThis.WebSocket', "export const open = () => new globalThis.WebSocket('wss://tasks.example.test')\n"],
    ['navigator.sendBeacon', "export const send = () => navigator.sendBeacon('/log', '')\n"],
  ])('sends %s to src/shared/api, not to the HTTP client', async (_case, code) => {
    const [connection] = await lint('src/entities/task/api/events.ts', code)

    expect(connection.message).toContain('src/shared/api only')
    expect(connection.message).not.toContain('call it from an api segment')
  })

  it('accepts fetch and a connection inside src/shared/api', async () => {
    const code =
      "export const load = () => fetch('/tasks')\nexport const open = () => new WebSocket('wss://tasks.example.test')\n"

    expect(await reportsOn('src/shared/api/transport.ts', code)).toEqual([])
  })

  // Left to convention: examples of what the lint does not read, the ones the layer's docs/ARCHITECTURE.md
  // names. A rule that starts reading one turns its case red, and the convention goes.
  it.each([
    ['fetch of top', "export const load = () => top?.fetch('/tasks')\n"],
    ['fetch of parent', "export const load = () => parent.fetch('/tasks')\n"],
    ['fetch of frames', "export const load = () => frames.fetch('/tasks')\n"],
    ['fetch of window.window', "export const load = () => window.window.fetch('/tasks')\n"],
    ['fetch of document.defaultView', "export const load = () => document.defaultView?.fetch('/tasks')\n"],
    ['fetch read with Reflect.get', "export const load = () => Reflect.get(window, 'fetch')\n"],
    ['an image that loads an address', "export const ping = () => {\n  new Image().src = '/log'\n}\n"],
    ['an audio element that loads an address', "export const ping = () => new Audio('/ping').play()\n"],
    ['an import() of an address', "export const load = () => import('https://cdn.example.test/tasks.js')\n"],
    ['a Worker', "export const start = () => new Worker('/worker.js')\n"],
    ['a SharedWorker', "export const start = () => new SharedWorker('/worker.js')\n"],
    ['a service worker', "export const install = () => navigator.serviceWorker.register('/sw.js')\n"],
    ['an RTCPeerConnection', 'export const open = () => new RTCPeerConnection()\n'],
    ['a WebTransport', "export const open = () => new WebTransport('https://tasks.example.test')\n"],
    ['a WebSocketStream', "export const open = () => new WebSocketStream('wss://tasks.example.test')\n"],
    ['fetchLater', "export const later = () => fetchLater('/log')\n"],
  ])('leaves to convention %s, which no rule reads', async (_case, code) => {
    expect(await reportsOn('src/entities/task/api/loadTasks.ts', code)).toEqual([])
  })
})

describe('every test runs', () => {
  it.each([
    ['it.skip', "import { it } from 'vitest'\nit.skip('waits', () => {})\n"],
    ['describe.skip', "import { describe } from 'vitest'\ndescribe.skip('waits', () => {})\n"],
    ['it.todo', "import { it } from 'vitest'\nit.todo('later')\n"],
    ['test.skipIf', "import { test } from 'vitest'\ntest.skipIf(true)('waits', () => {})\n"],
    ['it.runIf', "import { it } from 'vitest'\nit.runIf(false)('waits', () => {})\n"],
    ['a skip from inside the test', "import { it } from 'vitest'\nit('waits', (context) => context.skip())\n"],
  ])('rejects %s', async (_case, code) => {
    expect(await rulesBrokenBy('src/entities/task/model/task.extra.test.ts', code)).toContain(
      'no-restricted-properties',
    )
  })

  it.each([
    ['a skip in the options of it', "import { it } from 'vitest'\nit('waits', { skip: true }, () => {})\n"],
    ['a todo in the options of test', "import { test } from 'vitest'\ntest('later', { todo: true })\n"],
    [
      'a skip in the options of describe',
      "import { describe } from 'vitest'\ndescribe('waits', { skip: true }, () => {})\n",
    ],
    ['a todo in the options of suite', "import { suite } from 'vitest'\nsuite('later', { todo: true }, () => {})\n"],
    [
      'a skip in the options of describe.concurrent',
      "import { describe } from 'vitest'\ndescribe.concurrent('waits', { skip: true }, () => {})\n",
    ],
    [
      'a skip in the options of a case of it.each',
      "import { it } from 'vitest'\nit.each([1])('waits for %i', { skip: true }, () => {})\n",
    ],
    [
      'a skip in the options of a case of it.each with a table',
      "import { it } from 'vitest'\nit.each`\n  n\n  ${1}\n`('waits for $n', { skip: true }, () => {})\n",
    ],
    [
      'a todo in the options of a case of test.for with a table',
      "import { test } from 'vitest'\ntest.for`\n  n\n  ${1}\n`('later for $n', { todo: true }, () => {})\n",
    ],
    [
      'a skip in the options of a suite of describe.each with a table',
      "import { describe } from 'vitest'\ndescribe.each`\n  n\n  ${1}\n`('waits for $n', { skip: true }, () => {})\n",
    ],
    ['a skip named by a string', "import { it } from 'vitest'\nit('waits', { 'skip': true }, () => {})\n"],
    ['a todo named by a computed string', "import { it } from 'vitest'\nit('later', { ['todo']: true }, () => {})\n"],
    ['a skip named by a template literal', "import { it } from 'vitest'\nit('waits', { [`skip`]: true }, () => {})\n"],
    [
      'a skip whose value is computed',
      "import { it } from 'vitest'\nit('waits', { skip: !process.env.CI }, () => {})\n",
    ],
    ['options written as const', "import { it } from 'vitest'\nit('waits', { skip: true } as const, () => {})\n"],
    [
      'options checked with satisfies',
      "import { it, type TestOptions } from 'vitest'\nit('later', { todo: true } satisfies TestOptions, () => {})\n",
    ],
    [
      'options under an angle-bracket assertion',
      "import { it, type TestOptions } from 'vitest'\nit('waits', <TestOptions>{ skip: true }, () => {})\n",
    ],
    ['options with a non-null assertion', "import { it } from 'vitest'\nit('waits', ({ skip: true })!, () => {})\n"],
  ])('rejects %s', async (_case, code) => {
    expect(await rulesBrokenBy('src/entities/task/model/task.extra.test.ts', code)).toContain('tests/no-skip-option')
  })

  // The tests gate of the scaffold's layer turns these red from Vitest's report (--forbid-skipped), and the
  // layer's docs/ARCHITECTURE.md names them: a rule that learns to read one turns its case red here.
  it.each([
    [
      'options held in a variable',
      "import { it } from 'vitest'\nconst options = { skip: true }\nit('waits', options, () => {})\n",
    ],
    [
      'options brought in with a spread',
      "import { it } from 'vitest'\nconst off = { skip: true }\nit('waits', { ...off }, () => {})\n",
    ],
    [
      'a key computed from a name',
      "import { it } from 'vitest'\nconst KEY = 'skip'\nit('waits', { [KEY]: true }, () => {})\n",
    ],
    [
      'an it imported under another name',
      "import { it as check } from 'vitest'\ncheck('waits', { skip: true }, () => {})\n",
    ],
    ['an it read from an object', "import * as vitest from 'vitest'\nvitest.it('waits', { skip: true }, () => {})\n"],
    ['an it with no function', "import { it } from 'vitest'\nit('later')\n"],
  ])('leaves %s to the tests gate, which the rule does not read', async (_case, code) => {
    expect(await rulesBrokenBy('src/entities/task/model/task.extra.test.ts', code)).not.toContain(
      'tests/no-skip-option',
    )
  })

  it('accepts a skip or a todo set to false, which runs the test', async () => {
    const code =
      "import { describe, expect, it } from 'vitest'\ndescribe('runs', { skip: false }, () => {\n  it('runs too', { todo: false }, () => expect(1).toBe(1))\n})\n"

    expect(await reportsOn('src/entities/task/model/task.extra.test.ts', code)).toEqual([])
  })

  it('accepts a fixture named todo, which is no option of a test', async () => {
    const code = "import { test } from 'vitest'\nexport const withTodo = test.extend({ todo: 'write the tests' })\n"

    expect(await reportsOn('src/entities/task/model/task.extra.test.ts', code)).toEqual([])
  })

  it('keeps its rule where another block gives no-restricted-syntax its own options', async () => {
    // A test outside the layers: the block that refuses the file replaces no option of the test's rule.
    const code = "import { it } from 'vitest'\nit('waits', { skip: true }, () => {})\n"

    expect(await rulesBrokenBy('src/services/report.test.ts', code)).toEqual(
      expect.arrayContaining(['no-restricted-syntax', 'tests/no-skip-option']),
    )
  })
})

// What the lint makes of a file at a path: a test it reads as one, a file it refuses, or code.
// The probe trips the rule of every test that runs and, in src, the rules of the layers.
const PROBE =
  "import { it } from 'vitest'\nimport { RenameForm } from '@/features/rename-task/ui/RenameForm'\nit.skip(String(RenameForm), () => {})\n"

async function lintVerdictOf(path: string): Promise<'test' | 'refused' | 'code' | 'inconsistent'> {
  const broken = await rulesBrokenBy(path, PROBE)
  if (broken.includes('tests/no-stray-file')) return 'refused'
  const readAsTest = broken.includes('no-restricted-properties')
  const readByTheLayers = broken.some((rule) => rule.startsWith('fsd/'))
  if (readAsTest && !readByTheLayers) return 'test'
  if (!readAsTest && readByTheLayers === path.startsWith('src/')) return 'code'
  return 'inconsistent'
}

// Where Vitest looks for tests, read from the projects of the real vite.config.ts.
function includeOf(project: TestProjectConfiguration): string[] {
  if (typeof project === 'object' && !(project instanceof Promise) && project.test?.include) {
    return project.test.include
  }
  throw new Error('a project of vite.config.ts that this test cannot read: declare it inline, with its include')
}
function vitestInclude(): string[] {
  const projects = viteConfig.test?.projects
  if (projects === undefined) {
    throw new Error('vite.config.ts declares no test projects, the only place this test reads where Vitest looks')
  }
  return projects.flatMap(includeOf)
}
const VITEST_INCLUDE = vitestInclude()
const vitestRuns = (path: string): boolean => VITEST_INCLUDE.some((pattern) => posix.matchesGlob(path, pattern))

describe('every test is where Vitest runs it', () => {
  it.each([
    ['a .spec.ts in src', 'src/entities/task/model/task.spec.ts'],
    ['a .spec.tsx in src', 'src/entities/task/ui/TaskItem.spec.tsx'],
    ['a story in src', 'src/entities/task/ui/TaskItem.stories.tsx'],
    ['a story written as .ts', 'src/entities/task/ui/TaskItem.stories.ts'],
    ['a test outside the folders Vitest runs', 'scripts/check.test.ts'],
    ['a .spec.ts in tooling', 'tooling/agent-files/shell.spec.ts'],
    ['a .test.tsx in tooling, whose project runs .test.ts only', 'tooling/agent-files/shell.test.tsx'],
    ['a test at the root other than the lint cases', 'vite.config.test.ts'],
    ['a test in JavaScript', 'scripts/check.test.mjs'],
  ])('rejects %s', async (_case, path) => {
    const code = "import { expect, it } from 'vitest'\nit('fails', () => expect(1).toBe(2))\n"

    expect(await rulesBrokenBy(path, code)).toContain('tests/no-stray-file')
  })

  // A project Vitest runs is declared twice: in vite.config.ts, and in the list the lint reads it from.
  it('tells a test outside Vitest that a new project goes in vite.config.ts and in eslint.config.js', async () => {
    const messages = await lint(
      'scripts/check.test.ts',
      "import { expect, it } from 'vitest'\nit('runs', () => expect(1).toBe(1))\n",
    )
    const stray = messages.find((message) => message.ruleId === 'tests/no-stray-file')

    expect(stray?.message).toContain('a project for it in vite.config.ts')
    expect(stray?.message).toContain('VITEST_TESTS of eslint.config.js')
  })

  it("holds the rules of the layers over a story, which fsd-lint's default list would take for a test", async () => {
    const code =
      "import { App } from '@/app/App'\nimport { AddTaskForm } from '@/features/add-task'\nimport { HomePage } from '@/pages/home'\nexport const parts = [App, AddTaskForm, HomePage]\n"

    expect(await rulesBrokenBy('src/entities/task/ui/TaskItem.stories.ts', code)).toEqual(
      expect.arrayContaining(['tests/no-stray-file', 'fsd/forbidden-imports']),
    )
  })

  it('refuses the file without replacing the options another block gives no-restricted-syntax', async () => {
    const code = "export const load = () => import('../ui/TaskItem')\n"

    expect(await rulesBrokenBy('src/entities/task/model/task.spec.ts', code)).toEqual(
      expect.arrayContaining(['tests/no-stray-file', 'no-restricted-syntax']),
    )
  })

  // Vitest runs a file exactly when the lint reads it as a test: a project of vite.config.ts that looks
  // somewhere else, or a lint that reads another suffix, turns a row red.
  const REPRESENTATIVE: [string, 'test' | 'refused' | 'code'][] = [
    ['src/entities/task/model/task.test.ts', 'test'],
    ['src/app/App.test.tsx', 'test'],
    ['tooling/agent-files/site.test.ts', 'test'],
    ['eslint.config.test.ts', 'test'],
    ['src/entities/task/model/task.spec.ts', 'refused'],
    ['src/pages/home/ui/HomePage.spec.tsx', 'refused'],
    ['src/entities/task/ui/TaskItem.stories.tsx', 'refused'],
    ['tooling/agent-files/shell.test.tsx', 'refused'],
    ['tooling/agent-files/shell.spec.ts', 'refused'],
    ['scripts/check.test.ts', 'refused'],
    ['vite.config.test.ts', 'refused'],
    ['src/entities/task/model/task.ts', 'code'],
    // Only a name that ends in a suffix is a test: fsd-lint, left to itself, matches it anywhere in the path.
    ['src/entities/task/model/rows.test.tsv.ts', 'code'],
    ['tooling/agent-files/site.ts', 'code'],
  ]

  it.each(REPRESENTATIVE)('reads %s as Vitest does: %s', async (path, verdict) => {
    expect(await lintVerdictOf(path)).toBe(verdict)
    expect(vitestRuns(path)).toBe(verdict === 'test')
  })

  it('has a test row for every place Vitest looks', () => {
    const tests = REPRESENTATIVE.filter(([, verdict]) => verdict === 'test').map(([path]) => path)

    for (const pattern of VITEST_INCLUDE) {
      expect(
        tests.some((path) => posix.matchesGlob(path, pattern)),
        pattern,
      ).toBe(true)
    }
  })
})

describe('exceptions live in the configuration', () => {
  it('does not let a comment switch a rule off, and warns about the comment', async () => {
    const code = "/* eslint-disable */\nimport { createPortal } from 'react-dom'\nexport const portal = createPortal\n"

    const messages = await lint('src/entities/task/model/portal.ts', code)

    expect(messages).toContainEqual(expect.objectContaining({ ruleId: 'no-restricted-imports', severity: 2 }))
    expect(messages).toContainEqual(
      expect.objectContaining({ ruleId: null, severity: 1, message: expect.stringContaining("'noInlineConfig'") }),
    )
  })

  it('counts a warning as an error in the lint', () => {
    const manifest = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

    expect(manifest.scripts.lint).toContain('--max-warnings=0')
  })
})
