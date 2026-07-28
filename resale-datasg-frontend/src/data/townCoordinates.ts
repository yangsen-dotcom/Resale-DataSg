/**
 * Approximate centroid coordinates for HDB towns, in [latitude, longitude].
 *
 * The resale dataset has no geocoding at all - only town/block/street as text -
 * so these are well-known approximate town centers, not exact addresses. A town
 * returned by the API with no entry here is simply skipped on the map rather
 * than failing, in case the dataset ever adds a town not listed below.
 */
export const TOWN_COORDINATES: Record<string, [number, number]> = {
  'ANG MO KIO': [1.3691, 103.8454],
  BEDOK: [1.3236, 103.9273],
  BISHAN: [1.3526, 103.8352],
  'BUKIT BATOK': [1.359, 103.7637],
  'BUKIT MERAH': [1.2819, 103.8239],
  'BUKIT PANJANG': [1.3774, 103.7719],
  'BUKIT TIMAH': [1.3294, 103.8021],
  'CENTRAL AREA': [1.2966, 103.852],
  'CHOA CHU KANG': [1.384, 103.747],
  CLEMENTI: [1.3151, 103.7654],
  GEYLANG: [1.3201, 103.8918],
  HOUGANG: [1.3612, 103.8863],
  'JURONG EAST': [1.3329, 103.7436],
  'JURONG WEST': [1.3404, 103.709],
  'KALLANG/WHAMPOA': [1.31, 103.8651],
  'MARINE PARADE': [1.302, 103.9068],
  'PASIR RIS': [1.3721, 103.9474],
  PUNGGOL: [1.3984, 103.9072],
  QUEENSTOWN: [1.2942, 103.806],
  SEMBAWANG: [1.4491, 103.8185],
  SENGKANG: [1.3868, 103.8914],
  SERANGOON: [1.3554, 103.8679],
  TAMPINES: [1.3496, 103.9568],
  'TOA PAYOH': [1.3343, 103.8563],
  WOODLANDS: [1.4382, 103.7891],
  YISHUN: [1.4304, 103.8354],
}

export const SINGAPORE_CENTER: [number, number] = [1.3521, 103.8198]
