// @vitest-environment node
import { lstatSync, mkdtempSync, readFileSync, rmdirSync, symlinkSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ESLint, type Linter } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'

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
    // imported, re-exported and imported dynamically.
    const code =
      "import { AddTaskForm } from '@/features/add-task'\nimport { User } from '@/entities/user'\nimport { UserCard } from '@/entities/user/ui/UserCard'\nimport { Avatar } from '../../user'\nexport const parts = [AddTaskForm, User, UserCard, Avatar]\nexport { RenameForm } from '@/features/rename-task'\nexport { Badge } from '@/entities/user'\nexport { UserRow } from '@/entities/user/ui/UserRow'\nexport { Initials } from '../../user/lib/initials'\nexport const load = () => import('@/features/rename-task')\n"

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

describe('the layers over what fsd-lint 1.2.1 does not read: re-exports and a dynamic import()', () => {
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
  ])('rejects %s', async (_case, path, code, checks) => {
    expect(await gapChecksBrokenBy(path, code)).toEqual(checks)
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
      "import { render } from '@testing-library/react'\nimport { TaskItem } from '../ui/TaskItem'\nexport const draw = () => render(<TaskItem task={{ id: '1', title: 't', done: false }} onToggle={() => {}} />)\n"

    expect(await reportsOn('src/entities/task/model/task.view.test.tsx', code)).toEqual([])
  })
})

describe('the network through the shared HTTP client only', () => {
  it.each([
    ['fetch', "export const load = () => fetch('/tasks')\n", 'no-restricted-globals'],
    ['XMLHttpRequest', 'export const open = () => new XMLHttpRequest()\n', 'no-restricted-globals'],
    ['window.fetch', "export const load = () => window.fetch('/tasks')\n", 'no-restricted-properties'],
    ['globalThis.fetch', "export const load = () => globalThis.fetch('/tasks')\n", 'no-restricted-properties'],
    ['self.fetch', "export const load = () => self.fetch('/tasks')\n", 'no-restricted-properties'],
  ])('rejects %s outside src/shared/api', async (_case, code, rule) => {
    expect(await rulesBrokenBy('src/entities/task/api/loadTasks.ts', code)).toContain(rule)
  })

  it('accepts fetch inside the client', async () => {
    const code = "export const load = () => fetch('/tasks')\n"

    expect(await reportsOn('src/shared/api/transport.ts', code)).toEqual([])
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
