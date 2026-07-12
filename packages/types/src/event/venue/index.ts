import type { OnlineVenue } from "./OnlineVenue.js";
import type { PhysicalVenue } from "./PhysicalVenue.js";
import type { UnknownVenue } from "./UnknownVenue.js";

export type Venue = PhysicalVenue | OnlineVenue | UnknownVenue;
