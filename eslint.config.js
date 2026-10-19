import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import fsd from 'eslint-plugin-fsd-lint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import fsdGaps from './eslint-fsd-gaps.js'
import tests from './eslint-tests.js'

// The layers of Feature-Sliced Design, the only folders src/ holds, from the top down.
const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']
// The layers split into slices, each entered through its index.ts only.
const SLICED_LAYERS = ['pages', 'widgets', 'features', 'entities']
// src/ and its alias, which tsconfig.json alone declares ("@/*": ["./src/*"]). It is read as JSON,
// so a comment in it stops the lint here.
const SRC = fileURLToPath(new URL('src', import.meta.url))
const { paths } = JSON.parse(readFileSync(new URL('tsconfig.json', import.meta.url), 'utf8')).compilerOptions
const SRC_ALIAS = Object.keys(paths)
  .find((alias) => paths[alias].includes('./src/*'))
  ?.replace('*', '')
// fsd-lint reads '@' as its alias by default, so a scoped package like '@app/tokens' would
// be taken for the app layer: with the slash, only '@/...', what tsconfig.json declares,
// is the alias and everything else is a package.
const FSD_ALIAS = { value: SRC_ALIAS.replace(/\/$/, ''), withSlash: true }
// The segments that hold logic and no UI.
const LOGIC_SEGMENTS = 'src/**/{model,api,lib}/**'
// What the lint and Vitest take for a test: a file whose name ends in one of these suffixes, and nothing else.
const TEST_SUFFIXES = ['.test.ts', '.test.tsx']
const TESTS = TEST_SUFFIXES.map((suffix) => `**/*${suffix}`)
// fsd-lint matches each of its testFilesPatterns against the path as an unanchored regular expression ('.'
// escaped, '*' read as '.*'), in no-relative-imports with the path unnormalised: with '$' and no '/', a
// pattern takes the path that ends in a suffix, on every OS, and never one that only contains it. Its own
// default list would also take a .spec or a .stories file, and free it from the rules of the layers.
const FSD_OPTIONS = { alias: FSD_ALIAS, testFilesPatterns: TEST_SUFFIXES.map((suffix) => `*${suffix}$`) }
// Where the projects of vite.config.ts look for tests: a test anywhere else never runs. The two lists live in
// two files, and eslint.config.test.ts holds them equal on representative paths: a project added to
// vite.config.ts adds its include here and a representative path of its own to eslint.config.test.ts.
const VITEST_TESTS = [
  ...TEST_SUFFIXES.map((suffix) => `src/**/*${suffix}`),
  'tooling/**/*.test.ts',
  'eslint.config.test.ts',
]
// The extensions Vitest's own default include reads as code: a test, a .spec or a story named with any of them
// is seen, and one with another extension (task.spec.json, TaskItem.stories.mdx) is not code, and not linted.
const CODE = '?(c|m)[jt]s?(x)'
// Code src/ may not hold: every rule of this file reads .ts and .tsx files only.
const OTHER_CODE = 'src/**/*.{js,jsx,mjs,cjs,mts,cts}'
// What reaches the network: the requests the HTTP client sends, and the connections and beacons it does not.
const REQUESTS = ['fetch', 'XMLHttpRequest']
const CONNECTIONS = ['WebSocket', 'EventSource']
const GLOBAL_OBJECTS = ['window', 'globalThis', 'self']

const NO_UI_IN_LOGIC =
  'model, api and lib hold logic: a component, its styles and what renders it live in the ui segment.'
const ONLY_THE_CLIENT =
  'the HTTP client of src/shared/api is the only code that sends requests: call it from an api segment.'
const ONLY_SHARED_API_CONNECTS =
  'a connection to the network or a beacon is opened in src/shared/api only, next to the HTTP client: open it there and reach it from an api segment.'
const EVERY_TEST_RUNS =
  'a test that does not run checks nothing: make it pass or delete it; an exception is decided in eslint.config.js.'

// What a logic segment may not import, statically or dynamically: a ui segment,
// any entry of react-dom, the JSX runtimes and stylesheets.
const UI_MODULES = [
  '(^|/)ui(/|$)',
  '^react-dom(/|$)',
  '^react/jsx(-dev)?-runtime$',
  String.raw`\.(css|scss|sass|less|styl|stylus|pcss|postcss|sss)(\?.*)?$`,
]
// no-restricted-imports reads static imports only: a dynamic import of the same
// modules is matched as syntax. A selector's regex escapes its slashes.
function dynamicImportOf(modules, message) {
  const source = modules
    .map((module) => `(${module})`)
    .join('|')
    .replaceAll('/', String.raw`\/`)
  return { selector: `ImportExpression[source.value=/${source}/]`, message }
}
// A dynamic import of React brings it as a whole, as a default or namespace import would.
const NO_UI_DYNAMIC_IMPORT = dynamicImportOf([...UI_MODULES, '^react$'], NO_UI_IN_LOGIC)

export default defineConfig([
  globalIgnores(['dist', 'dev-dist', 'reports']),
  // A comment cannot switch a rule off: an exception lives in this file, next to its decision.
  { linterOptions: { noInlineConfig: true } },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
  },
  {
    // Feature-Sliced Design governs the application in src/ only: the build tooling in tooling/
    // and the configuration at the root are not application code.
    files: ['src/**/*.{ts,tsx}'],
    plugins: { fsd },
    rules: {
      'fsd/forbidden-imports': ['error', FSD_OPTIONS],
      'fsd/no-cross-slice-dependency': ['error', FSD_OPTIONS],
      'fsd/no-relative-imports': ['error', FSD_OPTIONS],
      'fsd/no-public-api-sidestep': [
        'error',
        { ...FSD_OPTIONS, layers: SLICED_LAYERS, publicApi: { allowSegmentImports: false } },
      ],
    },
  },
  {
    // fsd-lint 1.2.1 reads no re-export (export … from), fsd/forbidden-imports no dynamic import(), and none of
    // its rules import.meta.glob: the local rule holds the same boundaries over them (eslint-fsd-gaps.js).
    files: ['src/**/*.{ts,tsx}'],
    ignores: TESTS,
    plugins: { 'fsd-gaps': fsdGaps },
    rules: {
      'fsd-gaps/boundaries': ['error', { root: SRC, alias: SRC_ALIAS, layers: LAYERS, slicedLayers: SLICED_LAYERS }],
    },
  },
  {
    files: [`${LOGIC_SEGMENTS}/*.{ts,tsx}`],
    ignores: TESTS,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          // React itself only by name: its hooks are logic, an element is not.
          paths: [
            { name: 'react', importNames: ['default', 'createElement', 'cloneElement'], message: NO_UI_IN_LOGIC },
          ],
          patterns: UI_MODULES.map((regex) => ({ regex, message: NO_UI_IN_LOGIC })),
        },
      ],
      'no-restricted-syntax': ['error', NO_UI_DYNAMIC_IMPORT],
    },
  },
  {
    files: [`${LOGIC_SEGMENTS}/*.tsx`],
    ignores: TESTS,
    rules: {
      // The whole list again: a later config object replaces the options an earlier one gave this rule.
      'no-restricted-syntax': [
        'error',
        { selector: 'Program', message: `A .tsx file is UI: ${NO_UI_IN_LOGIC}` },
        NO_UI_DYNAMIC_IMPORT,
      ],
    },
  },
  {
    // Tests are left out: they hand the client a fake transport.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/shared/api/**', ...TESTS],
    rules: {
      'no-restricted-globals': [
        'error',
        ...REQUESTS.map((name) => ({ name, message: ONLY_THE_CLIENT })),
        ...CONNECTIONS.map((name) => ({ name, message: ONLY_SHARED_API_CONNECTS })),
      ],
      'no-restricted-properties': [
        'error',
        ...GLOBAL_OBJECTS.flatMap((object) => [
          ...REQUESTS.map((property) => ({ object, property, message: ONLY_THE_CLIENT })),
          ...CONNECTIONS.map((property) => ({ object, property, message: ONLY_SHARED_API_CONNECTS })),
        ]),
        // On any object: navigator, window.navigator, globalThis.navigator.
        { property: 'sendBeacon', message: ONLY_SHARED_API_CONNECTS },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: LAYERS.map((layer) => `src/${layer}/**`),
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program',
          message: `src/ holds only the layers ${LAYERS.join(', ')}: this file belongs in one of them.`,
        },
      ],
    },
  },
  {
    files: [OTHER_CODE],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program',
          message: 'src/ holds TypeScript in .ts and .tsx files, the only ones these rules read.',
        },
      ],
    },
  },
  {
    // A committed .only is rejected by Vitest itself (allowOnly in vite.config.ts). A skip the rules here do
    // not read, such as options held in a variable or an it imported under another name, turns the tests gate
    // of the scaffold's layer red from Vitest's report (--forbid-skipped).
    files: TESTS,
    plugins: { tests },
    rules: {
      'no-restricted-properties': [
        'error',
        ...['skip', 'todo', 'skipIf', 'runIf'].map((property) => ({ property, message: EVERY_TEST_RUNS })),
      ],
      'tests/no-skip-option': 'error',
    },
  },
  // A .spec, a story and a test where Vitest does not look are refused by a rule of their own, whose options
  // no other block replaces (eslint-tests.js); the three names never meet in one file.
  {
    files: [`**/*.spec.${CODE}`],
    plugins: { tests },
    rules: { 'tests/no-stray-file': ['error', 'spec'] },
  },
  {
    files: [`**/*.stories.${CODE}`],
    plugins: { tests },
    rules: { 'tests/no-stray-file': ['error', 'story'] },
  },
  {
    files: [`**/*.test.${CODE}`],
    ignores: VITEST_TESTS,
    plugins: { tests },
    rules: { 'tests/no-stray-file': ['error', 'outsideVitest'] },
  },
])
