Installationshinweise
=======================

1. Die alte Gallery App aus dem Apps Ordner löschen 
2. Die neue Gallery App in den Apps Ordner hochladen, danach wird die ownCloud aktualisiert, einfach auf "Aktualisierung starten" klicken und nach einer kurzen Zeit wird man wieder zurück geleitet.

Fertig!


ownCloud Version
=================

7.0.2 + 7.0.3

Tests
=========
Server Apache + php 5.3.3 + MySql

Browser on Mac: Safari, Firefox, Chrome, Opera

Demo
==============

Link: https://ssl.webpack.de/demo70.libasyscloud.de/owncloud/

Benutzer: demouser

Passwort: demouser



Gallery App Remasterd
===============

1. Sortierfunktion nach Name (entweder Dateiname oder wenn vorhanden iptc headline) und Erstellungsdatum
2. Auslesen von Exif und IPTC Daten inklusive GPS Longitude Latidute
3. Integration von googles bigshot https://code.google.com/p/bigshot/ in der Slideshow
4. Generierung der Images in der Slideshow mit der OC\Preview Klasse somit werden die großdargestellten Bilder nach der Generierung aus dem Cache geladen, es macht keinen Sinn wenn man bei einer Web App mit den Original Images arbeitet, hier idealerweise weboptimierte Images
5. Slideshow Darstellung von IPTC, Exif und GPS Daten (wahlweise an und ausschaltbar)
6. Slideshow nun mit Fullscreen modus
7. Bearbeitung von IPTC Daten Slideshow (headline, description, city, country, location) von Bildern, diese werden dann in der Originaldatei abgespeichert
8. Im persönlichen Bereich kann man nun einen Startpfad für die Galerie angeben, ist dieser eingetragen wird nur noch in diesem Ordner nach Bildern gesucht!
9. Batch Buttonintegration, hierdurch hat man die Möglichkeit in einem Ordner die Vorschaubilder für die Thumbnails und Großansichten zu generieren. (max. 1024px in der Großansicht)

Desweitern wurden viele Fehler behoben und an der Performance gearbeitet!
