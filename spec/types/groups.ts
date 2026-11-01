// Groups take a member type, `Layer` by default, so a group of overlays or of one kind of layer stays typed.
import {FeatureGroup, GeoJSON, LayerGroup, LayersControl, Map, Marker, Polyline, Tooltip} from 'leaflet';
import type {InteractiveLayerOptions, Layer} from 'leaflet';

const map = new Map('map');
const marker = new Marker([0, 0]);
const line = new Polyline([[0, 0], [1, 1]]);

// the default group takes any layer, and members have the Layer methods
const group = new LayerGroup([marker]).addLayer(line).addTo(map);
group.eachLayer(layer => layer.bindPopup('Hi'));
const first: Layer | undefined = group.getLayers()[0];

// a group of standalone tooltips, e.g. labels toggled together
const labels = new LayerGroup<Tooltip>();
new Tooltip({permanent: true}).setLatLng([0, 0]).setContent('A').addTo(labels);
labels.addLayer(new Tooltip());
labels.eachLayer(tooltip => tooltip.setContent('B'));
new LayersControl({}, {Labels: labels}).addTo(map);
// @ts-expect-error a tooltip isn't a Layer, so the default group would lie about its members
group.addLayer(new Tooltip());
// @ts-expect-error same for the overlay side
new Tooltip().addTo(group);
// @ts-expect-error feature groups open bound popups and tooltips on a member, which needs a Layer
new FeatureGroup<Tooltip>();

// typed members
const markers = new FeatureGroup<Marker>([marker]);
markers.getLayers()[0].setLatLng([1, 1]);
markers.getLayer(1)?.getLatLng();
// @ts-expect-error not a marker
markers.addLayer(line);

const mixed = new LayerGroup<Layer | Tooltip>([marker, new Tooltip()]);
mixed.eachLayer(layer => {
	if (layer instanceof Tooltip) { layer.setContent('C'); } else { layer.bindPopup('D'); }
});

// GeoJSON layers are always plain layers
new GeoJSON().eachLayer(layer => layer.feature);

// subclasses
class Cluster<O extends InteractiveLayerOptions = InteractiveLayerOptions> extends FeatureGroup<Marker, O> {
	firstLatLng() { return this.getLayers()[0]?.getLatLng(); }
}
new Cluster().addLayer(marker).addTo(map);
