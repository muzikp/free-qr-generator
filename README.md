# QR Studio

Statická jednostránková aplikace pro vytvoření QR kódu z webové adresy. Barvy čtverečků i pozadí lze upravit, kód stáhnout jako PNG nebo SVG a obrázek PNG zkopírovat do schránky v podporovaném prohlížeči přes HTTPS.

Zvolené barvy a jazyk rozhraní se ukládají pouze lokálně v prohlížeči pomocí `localStorage`.

Otevřete `index.html` v prohlížeči nebo složku nasaďte na libovolný statický hosting. Není potřeba build ani backend.

Výpočet QR kódu i export obrázků probíhá v prohlížeči. Při načtení stránky je potřeba připojení k internetu pro knihovnu [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) a webová písma.

Rozhraní lze přepnout mezi češtinou a angličtinou tlačítky v hlavičce. Volba jazyka se ukládá v prohlížeči.

## Nasazení na GitHub Pages

Publikování je nastavené z větve `main` a složky `/ (root)` v repozitáři `muzikp/free-qr-generator`. Vlastní doména v GitHub Pages je `qr.evalytics.cz`.

U správce DNS vytvořte záznam `CNAME` s názvem `qr` a cílem `muzikp.github.io` (bez názvu repozitáře). Po ověření DNS a vystavení certifikátu zapněte v **Settings → Pages** možnost **Enforce HTTPS**.
