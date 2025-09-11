export interface OSMPoint {
  osmId: number;
  name: string;
  longitude: number;
  latitude: number;
  geometry?: string;
  coordinates?: number[][];
  type?: string;
  distance?: number;
  // OSM tag fields (now available from VM)
  amenity?: string;
  tourism?: string;
  shop?: string;
  highway?: string;
  natural?: string;
  leisure?: string;
  cuisine?: string;
  brand?: string;
  phone?: string;
  website?: string;
  opening_hours?: string;
  'addr:housenumber'?: string;
  'addr:street'?: string;
  'addr:city'?: string;
  'addr:postcode'?: string;
  'addr:country'?: string;
  'addr:state'?: string;
  wheelchair?: string;
  outdoor_seating?: string;
  smoking?: string;
  wifi?: string;
  parking?: string;
  // Additional OSM fields that may be present
  [key: string]: any;
}

export interface MapFeature {
  id: number;
  featureType: string;
  name: string;
  geometry: any;
  properties: any;
}
