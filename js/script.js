var customIcon1 = L.icon({
  iconUrl: "/test-oliv/img/olivki.png",
  iconSize: [38, 38],
  iconAnchor: [22, 20],
  popupAnchor: [-3, -76],
});

var customIcon2 = L.icon({
  iconUrl: "/test-oliv/img/maslinki.png",
  iconSize: [38, 38],
  iconAnchor: [22, 20],
  popupAnchor: [-3, -76],
});

var customIcon3 = L.icon({
  iconUrl: "/test-oliv/img/olive-can.png",
  iconSize: [38, 38],
  iconAnchor: [22, 20],
  popupAnchor: [-3, -76],
});

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      var map = L.map("map").setView([lat, lng], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      var socket = new WebSocket("wss://server-olivky.herokuapp.com");

      socket.onopen = function () {
        console.log("Соединение установлено.");
      };

      socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        if (data.type === "initial-markers") {
          data.markers.forEach((marker) => {
            addMarkerAndCircle(marker.lat, marker.lng, marker.icon);
          });
        } else if (data.type === "new-marker") {
          addMarkerAndCircle(
            data.marker.lat,
            data.marker.lng,
            data.marker.icon
          );
        }
      };

      map.on("click", function (e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        const popupContent = document.createElement("div");

        const icon1Button = createIconButton(customIcon1, lat, lng);
        popupContent.appendChild(icon1Button);

        const icon2Button = createIconButton(customIcon2, lat, lng);
        popupContent.appendChild(icon2Button);

        const icon3Button = createIconButton(customIcon3, lat, lng);
        popupContent.appendChild(icon3Button);

        var popup = L.popup()
          .setLatLng([lat, lng])
          .setContent(popupContent)
          .openOn(map);

        function createIconButton(icon, lat, lng) {
          const iconButton = document.createElement("img");
          iconButton.className = "icon-preview";
          iconButton.style.width = "38px";
          iconButton.style.height = "38px";
          iconButton.src = icon.options.iconUrl;
          iconButton.onclick = function (event) {
            event.stopPropagation(); // Предотвращаем закрытие всплывающего окна
            addMarkerAndCircle(lat, lng, icon);
            map.closePopup();
          };
          return iconButton;
        }

        function sendMarker(lat, lng, icon) {
          const marker = { lat, lng, icon };
          socket.send(JSON.stringify({ type: "new-marker", marker }));
        }

        function addMarkerAndCircle(lat, lng, icon) {
          var marker = L.marker([lat, lng], { icon: icon }).addTo(map);
          var circle = L.circle([lat, lng], { radius: 100 }).addTo(map);

          setTimeout(function () {
            map.removeLayer(marker);
            map.removeLayer(circle);
          }, 5000);
        }
      });
    },
    function (error) {
      console.error("Ошибка при определении местоположения: ", error);
    }
  );
} else {
  console.error("Геолокация не поддерживается этим браузером.");
}
