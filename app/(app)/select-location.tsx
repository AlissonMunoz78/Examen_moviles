import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import { WebView } from "react-native-webview";

export default function SelectLocationScreen() {

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

      const map = L.map('map').setView(
        [-0.180653, -78.467834],
        13
      );

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors'
        }
      ).addTo(map);

      let marker;

      map.on('click', function(e) {

        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (marker) {
          map.removeLayer(marker);
        }

        marker = L.marker([lat, lng]).addTo(map);

        marker.bindPopup(
          'Ubicación seleccionada'
        ).openPopup();

        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            latitude: lat,
            longitude: lng
          })
        );
      });

    </script>
  </body>
  </html>
  `;

  const handleMessage = (event: any) => {

    const data = JSON.parse(event.nativeEvent.data);

    router.replace({
      pathname: "/(app)/add-dish",
      params: {
        manualLatitude: data.latitude.toString(),
        manualLongitude: data.longitude.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          padding: 16,
          backgroundColor: "#E31837",
        }}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          Toca el mapa para seleccionar ubicación
        </Text>
      </View>

      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
}