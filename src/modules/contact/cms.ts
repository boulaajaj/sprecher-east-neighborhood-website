// Payload entry: the form block, the form-builder plugin's options and the step that marks
// messages confirmed (#183), for payload.config.ts. Nothing here may be server-only, because the
// Payload CLI (migrations, seed) loads it outside Next.js.
export { FormBlock } from './cms/formBlock'
export { createFormBuilderOptions } from './cms/formBuilder'
export { markSubmissionsConfirmed } from './cms/senderEmail'
