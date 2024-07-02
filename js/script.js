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

        const icon1Button = document.createElement("img");
        icon1Button.className = "icon-preview";
        icon1Button.style.width = "38px";
        icon1Button.style.height = "38px";
        icon1Button.src = customIcon1.options.iconUrl;
        icon1Button.onclick = function () {
          sendMarker(lat, lng, customIcon1);
          map.closePopup();
        };
        popupContent.appendChild(icon1Button);

        const icon2Button = document.createElement("img");
        icon2Button.className = "icon-preview";
        icon2Button.style.width = "38px";
        icon2Button.style.height = "38px";
        icon2Button.src = customIcon2.options.iconUrl;
        icon2Button.onclick = function () {
          sendMarker(lat, lng, customIcon2);
          map.closePopup();
        };
        popupContent.appendChild(icon2Button);

        const icon3Button = document.createElement("img");
        icon3Button.className = "icon-preview";
        icon3Button.style.width = "48px";
        icon3Button.style.height = "48px";
        icon3Button.src = customIcon3.options.iconUrl;
        icon3Button.onclick = function () {
          sendMarker(lat, lng, customIcon3);
          map.closePopup();
        };
        popupContent.appendChild(icon3Button);

        L.popup().setLatLng([lat, lng]).setContent(popupContent).openOn(map);
      });

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
    },
    function (error) {
      console.error("Ошибка при определении местоположения: ", error);
    }
  );
} else {
  console.error("Геолокация не поддерживается этим браузером.");
}
