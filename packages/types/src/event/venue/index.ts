import type { OnlineVenue } from "./OnlineVenue";
import type { PhysicalVenue } from "./PhysicalVenue";
import type { UnknownVenue } from "./UnknownVenue";

export type Venue = PhysicalVenue | OnlineVenue | UnknownVenue;
