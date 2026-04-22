// enum values for types of GeoJSON features on the map
export const COUNTRY_CENTER_POINT_TYPE_PROPERTY = 'CountryCenterPoint';
export const COUNTRY_CENTER_LINE_TYPE_PROPERTY = 'CountryCenterLine';
export const TRAVEL_POINT_TYPE_PROPERTY = 'TravelPoint';
export const TRAVEL_LINE_TYPE_PROPERTY = 'TravelLine';
export const LASSO_AREA_TYPE_PROPERTY = 'LassoArea';

// enum values for what kind of focus is currently being handled
export const FOCUS_ENUM_COUNTRY = 1;
export const FOCUS_ENUM_TRAVEL = 2;

// enum for artwork count type
export const ARTWORK_COUNT_ENUM_ORIGIN = 1;
export const ARTWORK_COUNT_ENUM_DEST   = 2;
export const ARTWORK_COUNT_ENUM_BOTH   = 3;

// enum for type of appending that can be done with lassoing
export const APPEND_TYPE_ENUM_REPLACE = 1;
export const APPEND_TYPE_ENUM_ADDITIVE = 2;
export const APPEND_TYPE_ENUM_SUBTRACTIVE = 3;