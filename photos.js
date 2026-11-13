/*
 * B&H Scaffolding: Our Work photos
 * One line per set of photos. To add photos: put them in images/jobs/
 * as name-1.webp, name-2.webp ... then add a line below.
 *   category: residential | flats | commercial | roofing
 *   home: true shows the first photo on the homepage
 */
window.BH_PHOTOS = (function () {
  var out = [];
  function add(category, label, name, count, home) {
    for (var i = 1; i <= count; i++) out.push({ category: category, label: label, src: "images/jobs/" + name + "-" + i + ".webp", home: !!home && i === 1 });
  }
  add("commercial", "Industrial roof bridge", "industrial-roof-beams", 9, true);
  add("commercial", "Industrial access tower", "industrial-yard-tower", 2, true);
  add("commercial", "Beam over entrance", "entrance-beam-bridge", 1);
  add("commercial", "Beamed rear access", "mews-rear-beamed", 1);
  add("commercial", "Tall block on a beam", "tall-block-beamed", 1);
  add("commercial", "Care home access tower", "care-home-tower", 1);
  add("flats", "Housing blocks", "housing-block", 5, true);
  add("flats", "Housing blocks", "housing-terrace", 1);
  add("flats", "Estate block access tower", "estate-access-tower", 3);
  add("flats", "Wraparound scaffold", "flats-two-elevations", 2);
  add("flats", "Four-storey block", "four-storey-block", 2);
  add("flats", "Yellow-brick flats", "yellow-brick-flats", 2);
  add("flats", "Modern flats, glass balconies", "modern-flats-glass-balcony", 2);
  add("flats", "Flats entrance access", "flats-entrance-tower", 2);
  add("flats", "Courtyard flats", "courtyard-flats", 1);
  add("flats", "Modern block, courtyard", "modern-block-courtyard", 1);
  add("flats", "Rendered flats", "rendered-flats", 1);
  add("flats", "Narrow block of flats", "narrow-block", 1);
  add("flats", "Flats gable end", "flats-gable", 1);
  add("flats", "Mansion block access tower", "mansion-block-tower", 1);
  add("flats", "Balcony flats tower", "balcony-flats-tower", 1);
  add("flats", "Rear balcony block tower", "balcony-block-rear-tower", 1);
  add("flats", "Flats balcony scaffold", "flats-balcony-scaffold", 1);
  add("flats", "Balcony access", "modern-flats-balcony", 1);
  add("residential", "Tall London townhouse", "stucco-townhouse", 2, true);
  add("residential", "London terrace", "london-terrace-sw6", 1);
  add("residential", "Four-storey townhouse", "townhouse-beam-balcony", 2);
  add("residential", "Victorian terrace", "victorian-terrace-tower", 2);
  add("residential", "Georgian terrace", "georgian-terrace", 1);
  add("residential", "London terrace, rear", "london-terrace-rear", 2);
  add("residential", "Townhouse, debris chute", "townhouse-chute", 1);
  add("residential", "Yellow-brick townhouse", "yellow-brick-townhouse", 1);
  add("residential", "New-build terrace, rear", "new-build-terrace", 2);
  add("residential", "Pebbledash terrace", "pebbledash-terrace", 2);
  add("residential", "Loft conversion", "loft-conversion", 1);
  add("residential", "Terrace with debris chute", "chute-terrace", 1);
  add("residential", "Bay-window terrace", "bay-terrace-roof", 1);
  add("residential", "Terraced house", "terrace-red-door", 1);
  add("residential", "Loading tower", "loading-tower-house", 1);
  add("roofing", "Temporary roof on beams", "temporary-roof", 2, true);
  add("roofing", "Fully sheeted house", "sheeted-house", 2, true);
  add("roofing", "End-terrace roof", "end-terrace-roof", 2);
  add("roofing", "Semi-detached roof", "semi-roof-scaffold", 1);
  add("roofing", "Beam over conservatory", "rear-roof-beam", 1);
  add("roofing", "Roof edge protection", "roof-edge-protection", 1);
  add("roofing", "Extension roof", "extension-roof", 1);
  add("roofing", "Tile-hung terrace", "tile-hung-terrace", 1);
  add("roofing", "Chimney and gable", "rendered-semi", 1);
  return out;
})();
