# 0002: No repository layer over Payload

- **Date:** 2026-10-19
- **Status:** Accepted

## Context

A common reflex in layered designs is a `Repository<T>` interface per entity. Payload already
provides a typed Local API (`payload.find`, `findByID`, `create`…) with access control, hooks and
generated types.

## Decision

Don't wrap collections in generic repositories. Each module's `data/` functions are the boundary:
named for what the page needs (`findEventPage`, `getEventBySlug`), they call the Local API with an
explicit `overrideAccess`, and map documents to the module's own types (`EventSummary`).
Interfaces are reserved for outside services and real seams (see
[conventions](../conventions.md#interfaces-and-adapters)).

## Consequences

- Less code and no second abstraction to keep in sync with Payload.
- Swapping Payload for another store would mean rewriting each module's `data/`, which is
  acceptable: the domain rules and UI wouldn't change.

## Links

- Microsoft, designing the persistence layer: repositories "might be useful, but they are not
  critical for your DDD design" (https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design)
- Microsoft, DDD-oriented services: simpler responsibilities, like a CRUD service, "can be managed
  with simpler approaches" (https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice)
