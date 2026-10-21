# Platform

Code every module uses: pure helpers (`lib/`), Payload setup and role checks (`payload/`), UI
primitives (`ui/`), the token contract (`theme/`), rich text, email, SEO and media. It imports no
module, so any module can depend on it. Shared code moves here from the template folders (#135).

The full list and the rules are in
[`docs/architecture/`](../../docs/architecture/README.md#business-areas).
