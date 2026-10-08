# Governance

This document defines how the Open Evnt project makes decisions.

## 1. Scope

This document applies to these items:

- The contents of this repository
- The `directory.evnt.` namespace
- The `@evnt` packages in `packages`

## 2. Roles

### 2.1 Maintainers

A maintainer has write access to the repository. A maintainer does these tasks:

- Review pull requests
- Merge pull requests
- Approve changes to the specifications
- Publish the packages to npm

The current maintainer is [@deniz-blue](https://github.com/deniz-blue).

A maintainer can nominate a new maintainer. All current maintainers must agree.

### 2.2 Contributors

A contributor is a person who opens an issue or a pull request. You do not need permission to become a contributor.

## 3. How to make a decision

The maintainers make all decisions in public. Use these steps:

1. Open an issue. Describe the problem.
2. Discuss the problem in the issue.
3. Open a pull request with the change.
4. A maintainer reviews the pull request.
5. A maintainer merges or rejects the pull request.

A maintainer must give a reason when they reject a pull request.

## 4. Changes to a specification

There are two classes of change:

| Class       | Definition                                            | Procedure                      |
| ----------- | ----------------------------------------------------- | ------------------------------ |
| Editorial   | Corrects text, links, examples, or errors             | A maintainer merges the change |
| Substantive | Adds, removes, or changes a field, a rule, or a value | Refer to the procedure below   |

A substantive change needs these steps:

1. Open an issue. Describe the change and the reason for the change.
2. Keep the issue open for a minimum of 14 days.
3. Open a pull request that changes the specification.
4. Update the JSON schema in `docs/public` in the same pull request.
5. Update the changelog in the same pull request.

The version rules are in the specification. Refer to [Versioning](docs/spec/open-evnt-event.md#9-versioning).

## 5. The namespace

The project controls the domain `evnt.directory`. All reverse-domain names of the project start with `directory.evnt.`.

- Only a maintainer adds a name to the `directory.evnt.` namespace.
- Only a maintainer changes a name in the `directory.evnt.` namespace.
- An application must not add a name to the `directory.evnt.` namespace.

To define a custom component type, use a domain that you control. Refer to [Components](docs/spec/open-evnt-event.md#62-component-processing-rules).

## 6. Continuity

The maintainers control the domain `evnt.directory`, the GitHub organization `openevnt`, and the npm scope `@evnt`.

If a maintainer stops work on the project, these rules apply:

- The maintainer transfers the domain, the organization, and the npm scope to a new maintainer.
- If no maintainer remains, the contributors can fork the project.
- A fork must use a different namespace. A fork can use the `directory.evnt.` namespace only when it receives control of the domain `evnt.directory`.

## 7. Community

Discuss the project in these places:

- [GitHub issues](https://github.com/openevnt/evnt/issues)
- [Discord](https://deniz.blue/discord-invite?id=1493641727980994710)
- [Matrix](https://matrix.to/#/#evnt:catgirl.cloud)
