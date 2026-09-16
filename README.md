# QR Studio

Statická jednostránková aplikace pro vytvoření QR kódu z webové adresy. Kód lze stáhnout jako PNG nebo SVG.

Otevřete `index.html` v prohlížeči nebo složku nasaďte na libovolný statický hosting. Není potřeba build ani backend.

Výpočet QR kódu i export obrázků probíhá v prohlížeči. Při načtení stránky je potřeba připojení k internetu pro knihovnu [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) a webová písma.

Rozhraní lze přepnout mezi češtinou a angličtinou tlačítky v hlavičce. Volba jazyka se ukládá v prohlížeči.

## Nasazení na GitHub Pages

1. Nahrajte větev `main` do repozitáře na GitHubu.
2. V **Settings → Pages → Build and deployment** vyberte **Deploy from a branch**, větev `main` a složku `/ (root)`.
3. V **Settings → Pages → Custom domain** zadejte `qr.evalytics.cz` a uložte. Soubor `CNAME` je již připraven v kořeni projektu.
4. U správce DNS vytvořte záznam `CNAME` pro `qr`, který míří na `<vlastník>.github.io` (bez názvu repozitáře). Konkrétního vlastníka doplňte podle účtu nebo organizace, kam repozitář nahrajete.
5. Po ověření DNS v nastavení Pages zapněte **Enforce HTTPS**.
