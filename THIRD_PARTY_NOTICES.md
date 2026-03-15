# Third-Party Notices

This project depends on open source software from the community.
We acknowledge and thank all upstream maintainers.

This document summarizes direct third-party components currently used by this
repository and should be updated when dependencies or infrastructure tooling
changes.

## Application Dependencies (Direct)

| Package | Version | License | Purpose |
| ------- | ------- | ------- | ------- |
| @google/genai | 1.45.0 | Apache-2.0 | AI integration SDK |
| @tailwindcss/vite | 4.2.1 | MIT | Tailwind integration for Vite |
| @vitejs/plugin-react | 5.2.0 | MIT | React compiler/plugin support for Vite |
| clsx | 2.1.1 | MIT | Conditional class composition |
| dotenv | 17.3.1 | BSD-2-Clause | Environment variable loading |
| express | 4.22.1 | MIT | Node.js HTTP server support |
| jszip | 3.10.1 | MIT OR GPL-3.0-or-later | ZIP archive generation |
| lucide-react | 0.546.0 | ISC | Icon library for React UI |
| motion | 12.36.0 | MIT | Animation primitives |
| react | 19.2.4 | MIT | UI library |
| react-dom | 19.2.4 | MIT | React DOM renderer |
| tailwind-merge | 3.5.0 | MIT | Tailwind class conflict resolution |
| tailwindcss | 4.2.1 | MIT | Utility-first CSS framework |
| tsx | 4.21.0 | MIT | TypeScript execution helper |
| typescript | 5.8.3 | Apache-2.0 | Type checking and tooling |
| vite | 6.4.1 | MIT | Frontend bundler and dev server |
| @types/express | 4.17.25 | MIT | Express type definitions |
| @types/node | 22.19.15 | MIT | Node.js type definitions |
| autoprefixer | 10.4.27 | MIT | CSS vendor prefixing |

## Container and Runtime Components

| Component | License | Purpose |
| --------- | ------- | ------- |
| node:20-bookworm-slim | Node.js license terms and included OSS licenses | Build stage image |
| nginxinc/nginx-unprivileged:alpine | NGINX and included OSS licenses | Runtime serving layer |

## CI and Automation Components

| Component | License | Purpose |
| --------- | ------- | ------- |
| actions/checkout@v4 | MIT | Source checkout in workflows |
| mathieudutour/github-tag-action@v6.2 | MIT | Automated semantic tagging |
| ncipollo/release-action@v1 | MIT | GitHub release creation |
| docker/setup-buildx-action@v3 | Apache-2.0 | Docker Buildx setup |
| docker/login-action@v3 | Apache-2.0 | Registry authentication |
| docker/metadata-action@v5 | Apache-2.0 | Image metadata generation |
| docker/build-push-action@v5 | Apache-2.0 | Build and publish container images |

## Compliance Notes

- License compatibility and obligations must be reviewed before adding new
  dependencies.
- Some packages include dual licensing; ensure selected usage is compatible with
  your distribution model.
- Full license texts are available from upstream package repositories and
  published distribution artifacts.
