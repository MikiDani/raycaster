const fs = require('fs');

// Adatok, amiket a JSON fájlba szeretnél írni
const data = {
    key1: 'value1',
    key2: 'value2',
    key3: 'value3'
};

// JSON stringgé konvertáljuk az adatokat
const jsonData = JSON.stringify(data, null, 2); // A második paraméter (null) azért van, hogy a formázás bekapcsolva legyen, a harmadik paraméter pedig a belső térközök számát állítja be

// A fájl írása a gyökérmappába
fs.writeFileSync('mapdata.json', jsonData);

console.log('mapdata.json létrehozva sikeresen.');