import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import { WebView } from "react-native-webview";

export default function DishDetailScreen() {
  const params = useLocalSearchParams();

  const latitude = Number(params.latitude ?? 0);
  const longitude = Number(params.longitude ?? 0);
  const name = String(params.name ?? "Ubicación");

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />

    <script
      src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">
    </script>

    <style>
      html, body, #map {
        height: 100%;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>

  <body>
    <div id="map"></div>

    <script>
      window.onload = function () {

        const map = L.map('map').setView(
          [${latitude}, ${longitude}],
          16
        );

        L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: '&copy; OpenStreetMap contributors'
          }
        ).addTo(map);

        const marker = L.marker([
          ${latitude},
          ${longitude}
        ]).addTo(map);

        marker.bindPopup('${name}').openPopup();

        if (navigator.geolocation) {

          navigator.geolocation.getCurrentPosition((position) => {

            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            L.marker([userLat, userLng])
              .addTo(map)
              .bindPopup('Tu ubicación');

            const polyline = L.polyline([
              [userLat, userLng],
              [${latitude}, ${longitude}]
            ], {
              color: 'red'
            }).addTo(map);

            const distance = map.distance(
              [userLat, userLng],
              [${latitude}, ${longitude}]
            );

            const km = (distance / 1000).toFixed(2);

            polyline.bindPopup(
              'Distancia: ' + km + ' km'
            );
          });
        }
      }
    </script>
  </body>
  </html>
  `;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          padding: 16,
          backgroundColor: "#E31837",
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Ubicación del plato
        </Text>
      </View>

      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
}