'use strict';

angular.module('owm.home.cb', ['owm.resource', 'slick'])

//Module in app/pages/pagesModule.js
.controller('HomeCentraalBeheerController', function ($scope, $translate, resourceQueryService, $state, VERSION, resourceService) {

  $scope.$watch(function () {
    return $translate.use();
  }, function (lang) {
    if (lang) {
      $scope.lang = lang;
    }
  });

  if ($scope.features.featuredSlider) {
    var mock = {
      'jsonrpc': '2.0',
      'authenticated': false,
      'result': [{
        'contactPerson': {
          'id': 529554
        },
        'fleet': {
          'id': 2
        },
        'id': 1022,
        'providerId': 1,
        'alias': 'Peugeot 107 Talentenplein',
        'carOptions': '',
        'brand': 'PEUGEOT',
        'model': '107',
        'color': 'Blauw',
        'fuelType': 'benzine',
        'numberOfSeats': 4,
        'location': 'Talentenplein',
        'latitude': 52.51585,
        'longitude': 6.08829,
        'advertisement': 'In samenwerking met studentenhuisvester SSH heeft MyWheels een deelauto geplaatst aan het Talentenplein in Zwolle. De auto is voor alle studenten van de SSH beschikbaar, maar ook voor alle andere huurders in Zwolle. De auto is 24 uur per dag beschikbaar en je opent hem met je OV-chipkaart. Binnen 5 minuten na aanmelden kun je al rijden, we hoeven vooraf niets te weten over je OV-chipkaart.\n\nDe auto staat achter een slagboom, de slagboom open je met de kaart die in de auto ligt.',
        'refuelByRenter': false,
        'price': {
          'id': 21343,
          'hourRate': '1.75',
          'kilometerRate': '0.10',
          'fuelPerKilometer': '0.10',
          'kmFree': false,
          'dayRateTotal': '17.50',
          'insuranceRate': '0.000',
          'insuranceFee': null,
          'type': 'common'
        },
        'hourRate': null,
        'kilometerRate': null,
        'fuelPerKilometer': null,
        'kmFree': null,
        'dayRateTotal': null,
        'maxHours': null,
        'insuranceRate': null,
        'insuranceFee': null,
        'contactPersonId': 529554,
        'owner': {
          'id': 282,
          'slug': 'MyWheels',
          'preference': 'both',
          'firstName': 'MyWheels',
          'city': 'Amsterdam'
        },
        'ownerId': 282,
        'numberOfBookings': 431,
        'city': 'Zwolle',
        'pictures': [{
          'id': 14339,
          'url': 'resource\/180x120\/resource1022_4.jpeg',
          'large': 'resource\/500x330\/resource1022_4.jpeg',
          'normal': 'resource\/180x120\/resource1022_4.jpeg',
          'small': 'resource\/140x90\/resource1022_4.jpeg',
          'order': 0
        }, {
          'id': 14338,
          'url': 'resource\/180x120\/resource1022_3.jpeg',
          'large': 'resource\/500x330\/resource1022_3.jpeg',
          'normal': 'resource\/180x120\/resource1022_3.jpeg',
          'small': 'resource\/140x90\/resource1022_3.jpeg',
          'order': 1
        }, {
          'id': 11721,
          'url': 'resource\/180x120\/resource1022_2.jpeg',
          'large': 'resource\/500x330\/resource1022_2.jpeg',
          'normal': 'resource\/180x120\/resource1022_2.jpeg',
          'small': 'resource\/140x90\/resource1022_2.jpeg',
          'order': 2
        }],
        'locktype': 'chipcard',
        'locktypes': null,
        'response_accept': 694,
        'rating_totals': null
      }, {
        'contactPerson': {
          'id': 519038
        },
        'fleet': {
          'id': 2
        },
        'id': 9316,
        'providerId': 1,
        'alias': 'Citro\u00ebn C4 Cactus Debussystraat',
        'carOptions': null,
        'brand': 'Citro\u00ebn',
        'model': 'C4 Cactus',
        'color': 'GEEL',
        'fuelType': 'benzine',
        'numberOfSeats': 5,
        'location': 'Debussystraat 21',
        'latitude': 51.952557506621,
        'longitude': 5.2362191677094,
        'advertisement': 'Deze Citro\u00ebn C4 Cactus is te ontsluiten met een chipkaart. Beantwoord eerst de vraag over schade op de boardcomputer voordat je de auto start. In het dashboard kastje zit de handleiding en een zwart Go mapje met daarin een instructie en verkorte handleiding. Raadpleeg deze informatie voordat je gaat rijden. Op het 7 inch touchscreen zijn de functies van o.a. navigatie, audio, airco en telefoon te bedienen. Via dit scherm kun je ook de handleiding raadplegen. Tank de auto af met de tankpas als de auto bij het wegzetten \u2264 \u00bc tank inhoud heeft. Controleer altijd of de auto op slot is voor je wegloopt. Alleen met een afgesloten auto eindigt je huurperiode en daarmee je verantwoordelijkheid.',
        'refuelByRenter': false,
        'price': {
          'id': 23448,
          'hourRate': '2.50',
          'kilometerRate': '0.18',
          'fuelPerKilometer': '0.11',
          'kmFree': false,
          'dayRateTotal': '25.00',
          'insuranceRate': '0.000',
          'insuranceFee': '0.000',
          'type': 'common'
        },
        'hourRate': null,
        'kilometerRate': null,
        'fuelPerKilometer': null,
        'kmFree': null,
        'dayRateTotal': null,
        'maxHours': null,
        'insuranceRate': null,
        'insuranceFee': null,
        'contactPersonId': 519038,
        'owner': {
          'id': 519038,
          'slug': 'visscher2go',
          'preference': 'both',
          'firstName': 'Visscher2Go',
          'city': 'Culemborg'
        },
        'ownerId': 519038,
        'numberOfBookings': 521,
        'city': 'Culemborg',
        'pictures': [{
          'id': 14183,
          'url': 'resource\/180x120\/resource9316_0.png',
          'large': 'resource\/500x330\/resource9316_0.png',
          'normal': 'resource\/180x120\/resource9316_0.png',
          'small': 'resource\/140x90\/resource9316_0.png',
          'order': 0
        }, {
          'id': 9285,
          'url': 'resource\/180x120\/5506f152ec3dc.jpeg',
          'large': 'resource\/500x330\/5506f152ec3dc.jpeg',
          'normal': 'resource\/180x120\/5506f152ec3dc.jpeg',
          'small': 'resource\/140x90\/5506f152ec3dc.jpeg',
          'order': 1
        }, {
          'id': 12577,
          'url': 'resource\/180x120\/resource9316_1.jpeg',
          'large': 'resource\/500x330\/resource9316_1.jpeg',
          'normal': 'resource\/180x120\/resource9316_1.jpeg',
          'small': 'resource\/140x90\/resource9316_1.jpeg',
          'order': 2
        }],
        'locktype': 'chipcard',
        'locktypes': null,
        'response_accept': 835,
        'rating_totals': null
      }, {
        'contactPerson': {
          'id': 4150
        },
        'fleet': {
          'id': 2
        },
        'id': 1246,
        'providerId': 1,
        'alias': 'Fiat Punto Niemeijerstraat',
        'carOptions': 'Trekhaak,Airco,Winterbanden, Automaat',
        'brand': 'FIAT',
        'model': 'Punto Evo',
        'color': 'Antraciet grijs',
        'fuelType': 'benzine',
        'numberOfSeats': 5,
        'location': 'Niemeijerstraat 53',
        'latitude': 51.9628233,
        'longitude': 5.6609016,
        'advertisement': 'Een prima deelauto in eigendom van MyWheels. 24 uur per dag beschikbaar. Onmiddellijk reactie of rit geaccepteerd wordt. Te openen met je OV-chipkaart.\n\nAutomaat. Auto staat geparkeerd bij het deelautobord op het parkeerterrein op het Rijnbolwerk bij het gemaal op de kop van het Emmapark. A.u.b. uw fiets bij de parkeerplaats zetten!',
        'refuelByRenter': false,
        'price': {
          'id': 1462,
          'hourRate': '2.50',
          'kilometerRate': '0.20',
          'fuelPerKilometer': '0.13',
          'kmFree': false,
          'dayRateTotal': '25.00',
          'insuranceRate': '0.000',
          'insuranceFee': null,
          'type': 'common'
        },
        'hourRate': null,
        'kilometerRate': null,
        'fuelPerKilometer': null,
        'kmFree': null,
        'dayRateTotal': null,
        'maxHours': null,
        'insuranceRate': null,
        'insuranceFee': null,
        'contactPersonId': 4150,
        'owner': {
          'id': 282,
          'slug': 'MyWheels',
          'preference': 'both',
          'firstName': 'MyWheels',
          'city': 'Amsterdam'
        },
        'ownerId': 282,
        'numberOfBookings': 669,
        'city': 'Wageningen',
        'pictures': [{
          'id': 12543,
          'url': 'resource\/180x120\/resource1246_0.jpeg',
          'large': 'resource\/500x330\/resource1246_0.jpeg',
          'normal': 'resource\/180x120\/resource1246_0.jpeg',
          'small': 'resource\/140x90\/resource1246_0.jpeg',
          'order': 0
        }, {
          'id': 12544,
          'url': 'resource\/180x120\/resource1246_1.jpeg',
          'large': 'resource\/500x330\/resource1246_1.jpeg',
          'normal': 'resource\/180x120\/resource1246_1.jpeg',
          'small': 'resource\/140x90\/resource1246_1.jpeg',
          'order': 1
        }, {
          'id': 12545,
          'url': 'resource\/180x120\/resource1246_2.jpeg',
          'large': 'resource\/500x330\/resource1246_2.jpeg',
          'normal': 'resource\/180x120\/resource1246_2.jpeg',
          'small': 'resource\/140x90\/resource1246_2.jpeg',
          'order': 2
        }],
        'locktype': 'chipcard',
        'locktypes': null,
        'response_accept': 1002,
        'rating_totals': null
      }, {
        'fleet': {
          'id': 1
        },
        'id': 14046,
        'providerId': 1,
        'alias': 'Reanult ZOE 100% elektrisch',
        'carOptions': null,
        'brand': 'RENAULT',
        'model': 'ZOE',
        'color': 'GRIJS',
        'fuelType': 'elektrisch',
        'numberOfSeats': 4,
        'location': 'Boschdijk',
        'latitude': 51.4781242,
        'longitude': 5.4377625,
        'advertisement': 'Ervaar 100% elektrisch rijden zonder brandstofkosten. Tot 150 km bereik afhankelijk hoe gereden wordt.\nGeen uitlaatgassen, CO2 uitstoot en opgeladen met 100% groene wind\/zon energie. In overleg kan gebruik gemaakt worden van een laadpas en laadkabel, ook voor in stopcontact.',
        'refuelByRenter': false,
        'price': {
          'id': 17163,
          'hourRate': '5.00',
          'kilometerRate': '0.20',
          'fuelPerKilometer': '0.00',
          'kmFree': true,
          'dayRateTotal': '40.00',
          'insuranceRate': '0.125',
          'insuranceFee': '0.000',
          'type': 'common'
        },
        'hourRate': null,
        'kilometerRate': null,
        'fuelPerKilometer': null,
        'kmFree': null,
        'dayRateTotal': null,
        'maxHours': null,
        'insuranceRate': null,
        'insuranceFee': null,
        'contactPersonId': null,
        'owner': {
          'id': 524452,
          'slug': 'guidow',
          'preference': 'both',
          'firstName': 'Guido',
          'city': 'Eindhoven'
        },
        'ownerId': 524452,
        'numberOfBookings': 0,
        'city': 'Eindhoven',
        'pictures': [{
          'id': 11759,
          'url': 'resource\/180x120\/resource14046_0.jpeg',
          'large': 'resource\/500x330\/resource14046_0.jpeg',
          'normal': 'resource\/180x120\/resource14046_0.jpeg',
          'small': 'resource\/140x90\/resource14046_0.jpeg',
          'order': 0
        }, {
          'id': 11760,
          'url': 'resource\/180x120\/resource14046_1.jpeg',
          'large': 'resource\/500x330\/resource14046_1.jpeg',
          'normal': 'resource\/180x120\/resource14046_1.jpeg',
          'small': 'resource\/140x90\/resource14046_1.jpeg',
          'order': 1
        }, {
          'id': 11761,
          'url': 'resource\/180x120\/resource14046_2.jpeg',
          'large': 'resource\/500x330\/resource14046_2.jpeg',
          'normal': 'resource\/180x120\/resource14046_2.jpeg',
          'small': 'resource\/140x90\/resource14046_2.jpeg',
          'order': 2
        }],
        'locktype': 'meeting',
        'locktypes': null,
        'response_accept': null,
        'rating_totals': null
      }, {
        'contactPerson': {
          'id': 37887
        },
        'fleet': {
          'id': 2
        },
        'id': 2121,
        'providerId': 1,
        'alias': 'Hyundai i10 Simon Vestdijk',
        'carOptions': 'Airco, winterbanden',
        'brand': 'HYUNDAI',
        'model': 'i10',
        'color': 'Ice Silver',
        'fuelType': 'benzine',
        'numberOfSeats': 5,
        'location': 'Simon Vestdijklaan 16',
        'latitude': 52.1898507,
        'longitude': 4.4813216,
        'advertisement': 'Een prima deelauto in eigendom van MyWheels. 24 uur per dag beschikbaar. Onmiddellijk reactie of rit geaccepteerd wordt. Te openen met je OV-chipkaart. Deze auto heeft all-weather banden, een combinatie van zomer -en winterbanden in \u00e9\u00e9n. Daardoor heb je bij zowel lage als hoge temperaturen voldoende grip.\n\nDe auto staat geparkeerd op de parkeerplaats aan de Simon Vestdijklaan, tegenover nr. 16\nAls deze parkeerplaats vol is, staat de auto geparkeerd op de parkeerplaats tegenover nr. 4\n\nLET OP: De binnenspiegel ontbreekt op dit moment. Woensdag 24 augustus gaat de auto naar de garage om de spiegel weer vast te zetten.',
        'refuelByRenter': false,
        'price': {
          'id': 1431,
          'hourRate': '2.50',
          'kilometerRate': '0.13',
          'fuelPerKilometer': '0.13',
          'kmFree': false,
          'dayRateTotal': '25.00',
          'insuranceRate': '0.000',
          'insuranceFee': null,
          'type': 'common'
        },
        'hourRate': null,
        'kilometerRate': null,
        'fuelPerKilometer': null,
        'kmFree': null,
        'dayRateTotal': null,
        'maxHours': null,
        'insuranceRate': null,
        'insuranceFee': null,
        'contactPersonId': 37887,
        'owner': {
          'id': 282,
          'slug': 'MyWheels',
          'preference': 'both',
          'firstName': 'MyWheels',
          'city': 'Amsterdam'
        },
        'ownerId': 282,
        'numberOfBookings': 647,
        'city': 'Oegstgeest',
        'pictures': [{
          'id': 10878,
          'url': 'resource\/180x120\/resource2121_0.jpeg',
          'large': 'resource\/500x330\/resource2121_0.jpeg',
          'normal': 'resource\/180x120\/resource2121_0.jpeg',
          'small': 'resource\/140x90\/resource2121_0.jpeg',
          'order': 0
        }, {
          'id': 10879,
          'url': 'resource\/180x120\/resource2121_1.jpeg',
          'large': 'resource\/500x330\/resource2121_1.jpeg',
          'normal': 'resource\/180x120\/resource2121_1.jpeg',
          'small': 'resource\/140x90\/resource2121_1.jpeg',
          'order': 1
        }, {
          'id': 10880,
          'url': 'resource\/180x120\/resource2121_2.jpeg',
          'large': 'resource\/500x330\/resource2121_2.jpeg',
          'normal': 'resource\/180x120\/resource2121_2.jpeg',
          'small': 'resource\/140x90\/resource2121_2.jpeg',
          'order': 2
        }],
        'locktype': 'chipcard',
        'locktypes': null,
        'response_accept': 1116,
        'rating_totals': null
      }, {
        'contactPerson': {
          'id': 20186
        },
        'fleet': {
          'id': 2
        },
        'id': 1264,
        'providerId': 1,
        'alias': 'De Yaris bij Nieuwe Energie',
        'carOptions': '',
        'brand': 'TOYOTA',
        'model': 'Yaris Nieuwe Energie',
        'color': 'Ice silver',
        'fuelType': 'benzine',
        'numberOfSeats': 5,
        'location': '3e Binnenvestgracht 23',
        'latitude': 52.1640854,
        'longitude': 4.491519,
        'advertisement': 'Een prima deelauto in eigendom van MyWheels. 24 uur per dag beschikbaar. Onmiddellijk reactie of rit geaccepteerd wordt. Te openen met je OV-chipkaart. Handige wagen. Ruim en comfortabel voor zijn prijs.\n\nLET OP: bij het starten de koppeling goed intrappen.',
        'refuelByRenter': false,
        'price': {
          'id': 1441,
          'hourRate': '2.50',
          'kilometerRate': '0.16',
          'fuelPerKilometer': '0.13',
          'kmFree': false,
          'dayRateTotal': '25.00',
          'insuranceRate': '0.000',
          'insuranceFee': null,
          'type': 'common'
        },
        'hourRate': null,
        'kilometerRate': null,
        'fuelPerKilometer': null,
        'kmFree': null,
        'dayRateTotal': null,
        'maxHours': null,
        'insuranceRate': null,
        'insuranceFee': null,
        'contactPersonId': 20186,
        'owner': {
          'id': 282,
          'slug': 'MyWheels',
          'preference': 'both',
          'firstName': 'MyWheels',
          'city': 'Amsterdam'
        },
        'ownerId': 282,
        'numberOfBookings': 964,
        'city': 'Leiden',
        'pictures': [{
          'id': 10872,
          'url': 'resource\/180x120\/resource1264_0.jpeg',
          'large': 'resource\/500x330\/resource1264_0.jpeg',
          'normal': 'resource\/180x120\/resource1264_0.jpeg',
          'small': 'resource\/140x90\/resource1264_0.jpeg',
          'order': 0
        }, {
          'id': 10873,
          'url': 'resource\/180x120\/resource1264_1.jpeg',
          'large': 'resource\/500x330\/resource1264_1.jpeg',
          'normal': 'resource\/180x120\/resource1264_1.jpeg',
          'small': 'resource\/140x90\/resource1264_1.jpeg',
          'order': 1
        }, {
          'id': 10874,
          'url': 'resource\/180x120\/resource1264_2.jpeg',
          'large': 'resource\/500x330\/resource1264_2.jpeg',
          'normal': 'resource\/180x120\/resource1264_2.jpeg',
          'small': 'resource\/140x90\/resource1264_2.jpeg',
          'order': 2
        }],
        'locktype': 'chipcard',
        'locktypes': null,
        'response_accept': 1444,
        'rating_totals': null
      }, {
        'contactPerson': {
          'id': 40346
        },
        'fleet': {
          'id': 2
        },
        'id': 2006,
        'providerId': 1,
        'alias': 'Peugeot 107 Arubastraat',
        'carOptions': '',
        'brand': 'PEUGEOT',
        'model': '107',
        'color': 'Bleu Electra',
        'fuelType': 'benzine',
        'numberOfSeats': 4,
        'location': 'Arubastraat 14',
        'latitude': 52.3601379,
        'longitude': 4.8526454,
        'advertisement': 'Een prima deelauto in eigendom van MyWheels. 24 uur per dag beschikbaar. Onmiddellijk reactie of rit geaccepteerd wordt. Te openen met je OV-chipkaart.\nDe auto staat geparkeerd in de Arubastraat tegenover nummer 17.Door geplande werkzaamheden geldt er een parkeerverbod op de vaste plek van 13-7 t\/m 15-7.\nBel voor foutparkeerders om de auto weg te laten slepen svp 020-2513323 of kantoor 0228-514824',
        'refuelByRenter': false,
        'price': {
          'id': 147,
          'hourRate': '2.50',
          'kilometerRate': '0.13',
          'fuelPerKilometer': '0.13',
          'kmFree': false,
          'dayRateTotal': '25.00',
          'insuranceRate': '0.000',
          'insuranceFee': null,
          'type': 'common'
        },
        'hourRate': null,
        'kilometerRate': null,
        'fuelPerKilometer': null,
        'kmFree': null,
        'dayRateTotal': null,
        'maxHours': null,
        'insuranceRate': null,
        'insuranceFee': null,
        'contactPersonId': 40346,
        'owner': {
          'id': 282,
          'slug': 'MyWheels',
          'preference': 'both',
          'firstName': 'MyWheels',
          'city': 'Amsterdam'
        },
        'ownerId': 282,
        'numberOfBookings': 812,
        'city': 'Amsterdam',
        'pictures': [{
          'id': 10706,
          'url': 'resource\/180x120\/resource2006_0.jpeg',
          'large': 'resource\/500x330\/resource2006_0.jpeg',
          'normal': 'resource\/180x120\/resource2006_0.jpeg',
          'small': 'resource\/140x90\/resource2006_0.jpeg',
          'order': 0
        }, {
          'id': 10707,
          'url': 'resource\/180x120\/resource2006_1.jpeg',
          'large': 'resource\/500x330\/resource2006_1.jpeg',
          'normal': 'resource\/180x120\/resource2006_1.jpeg',
          'small': 'resource\/140x90\/resource2006_1.jpeg',
          'order': 1
        }, {
          'id': 10708,
          'url': 'resource\/180x120\/resource2006_2.jpeg',
          'large': 'resource\/500x330\/resource2006_2.jpeg',
          'normal': 'resource\/180x120\/resource2006_2.jpeg',
          'small': 'resource\/140x90\/resource2006_2.jpeg',
          'order': 2
        }],
        'locktype': 'chipcard',
        'locktypes': null,
        'response_accept': 1278,
        'rating_totals': null
      }, {
        'fleet': {
          'id': 1
        },
        'id': 9738,
        'providerId': 1,
        'alias': 'Mooie Volkswagen T2 bus (T2a, 1970)',
        'carOptions': null,
        'brand': 'VOLKSWAGEN',
        'model': 'TRANSPORTER',
        'color': 'ROOD',
        'fuelType': 'benzine',
        'numberOfSeats': 7,
        'location': 'Alberdingk Thijmstraat 2-80',
        'latitude': 52.093904088006,
        'longitude': 5.0986325740814,
        'advertisement': 'Het ultieme onthaasten! \n\nHuur nu deze schitterende Volkswagen T2 uit 1970. Leuk voor een trouwerij, dagje uit of gewoon voor de fun.\n\nSleutel ophalen en inleveren in de binnenstad van utrecht (ma-vr 7:30, za-zo 9:00), bus staat 10 minuten verderop (begin vleutense weg, parkeergelegenheid voor andere auto)\n\nLangere periode dan 3 dagen huren? Laat een bericht achter!',
        'refuelByRenter': true,
        'price': {
          'id': 19705,
          'hourRate': '100.00',
          'kilometerRate': '0.15',
          'fuelPerKilometer': '0.00',
          'kmFree': true,
          'dayRateTotal': '175.00',
          'insuranceRate': '0.000',
          'insuranceFee': '0.000',
          'type': 'common'
        },
        'hourRate': null,
        'kilometerRate': null,
        'fuelPerKilometer': null,
        'kmFree': null,
        'dayRateTotal': null,
        'maxHours': null,
        'insuranceRate': null,
        'insuranceFee': null,
        'contactPersonId': null,
        'owner': {
          'id': 500123,
          'slug': null,
          'preference': 'owner',
          'firstName': 'Menno',
          'city': 'Utrecht'
        },
        'ownerId': 500123,
        'numberOfBookings': 1,
        'city': 'Utrecht',
        'pictures': [{
          'id': 10027,
          'url': 'resource\/180x120\/resource9738_0.jpeg',
          'large': 'resource\/500x330\/resource9738_0.jpeg',
          'normal': 'resource\/180x120\/resource9738_0.jpeg',
          'small': 'resource\/140x90\/resource9738_0.jpeg',
          'order': 0
        }, {
          'id': 10028,
          'url': 'resource\/180x120\/resource9738_1.jpeg',
          'large': 'resource\/500x330\/resource9738_1.jpeg',
          'normal': 'resource\/180x120\/resource9738_1.jpeg',
          'small': 'resource\/140x90\/resource9738_1.jpeg',
          'order': 1
        }, {
          'id': 10029,
          'url': 'resource\/180x120\/resource9738_2.jpeg',
          'large': 'resource\/500x330\/resource9738_2.jpeg',
          'normal': 'resource\/180x120\/resource9738_2.jpeg',
          'small': 'resource\/140x90\/resource9738_2.jpeg',
          'order': 2
        }],
        'locktype': 'meeting',
        'locktypes': null,
        'response_accept': 1,
        'rating_totals': null
      }, {
        'fleet': {
          'id': 1
        },
        'id': 9278,
        'providerId': 1,
        'alias': 'Renault Master',
        'carOptions': null,
        'brand': 'RENAULT',
        'model': 'MASTER',
        'color': 'Wit',
        'fuelType': 'diesel',
        'numberOfSeats': 3,
        'location': 'Provincialeweg 80',
        'latitude': 52.06445,
        'longitude': 5.18783,
        'advertisement': null,
        'refuelByRenter': false,
        'price': {
          'id': 21474,
          'hourRate': '7.50',
          'kilometerRate': '0.13',
          'fuelPerKilometer': '0.12',
          'kmFree': true,
          'dayRateTotal': '30.00',
          'insuranceRate': '0.125',
          'insuranceFee': '0.000',
          'type': 'common'
        },
        'hourRate': null,
        'kilometerRate': null,
        'fuelPerKilometer': null,
        'kmFree': null,
        'dayRateTotal': null,
        'maxHours': null,
        'insuranceRate': null,
        'insuranceFee': null,
        'contactPersonId': null,
        'owner': {
          'id': 509438,
          'slug': null,
          'preference': 'owner',
          'firstName': 'Jos',
          'city': 'Bunnik'
        },
        'ownerId': 509438,
        'numberOfBookings': 57,
        'city': 'Bunnik',
        'pictures': [{
          'id': 9344,
          'url': 'resource\/180x120\/550a9e88679cc.jpeg',
          'large': 'resource\/500x330\/550a9e88679cc.jpeg',
          'normal': 'resource\/180x120\/550a9e88679cc.jpeg',
          'small': 'resource\/140x90\/550a9e88679cc.jpeg',
          'order': 0
        }],
        'locktype': 'meeting',
        'locktypes': null,
        'response_accept': 79,
        'rating_totals': null
      }, {
        'fleet': {
          'id': 1
        },
        'id': 7644,
        'providerId': 1,
        'alias': 'Blauwe Aygo',
        'carOptions': null,
        'brand': 'TOYOTA',
        'model': 'Aygo',
        'color': 'Blauw',
        'fuelType': 'benzine',
        'numberOfSeats': 4,
        'location': 'Laan der Verenigde Naties 4',
        'latitude': 52.3348828,
        'longitude': 5.6176969000001,
        'advertisement': 'Toyota Aygo automaat\n\nAutomaat, airco, navigatie, cruisecontrol, kinderzitje',
        'refuelByRenter': false,
        'price': {
          'id': 5957,
          'hourRate': '2.50',
          'kilometerRate': '0.13',
          'fuelPerKilometer': '0.12',
          'kmFree': true,
          'dayRateTotal': '30.00',
          'insuranceRate': '0.125',
          'insuranceFee': null,
          'type': 'common'
        },
        'hourRate': null,
        'kilometerRate': null,
        'fuelPerKilometer': null,
        'kmFree': null,
        'dayRateTotal': null,
        'maxHours': null,
        'insuranceRate': null,
        'insuranceFee': null,
        'contactPersonId': null,
        'owner': {
          'id': 510976,
          'slug': null,
          'preference': 'owner',
          'firstName': 'Rick',
          'city': 'Harderwijk'
        },
        'ownerId': 510976,
        'numberOfBookings': 6,
        'city': 'Harderwijk',
        'pictures': [{
          'id': 6681,
          'url': 'resource\/180x120\/5377c0b4de53a.jpeg',
          'large': 'resource\/500x330\/5377c0b4de53a.jpeg',
          'normal': 'resource\/180x120\/5377c0b4de53a.jpeg',
          'small': 'resource\/140x90\/5377c0b4de53a.jpeg',
          'order': 0
        }],
        'locktype': 'meeting',
        'locktypes': null,
        'response_accept': 6,
        'rating_totals': null
      }, {
        'fleet': {
          'id': 1
        },
        'id': 7066,
        'providerId': 1,
        'alias': 'Kyoto\'s Wheels',
        'carOptions': null,
        'brand': 'MITSUBISHI',
        'model': 'i MiEV 100% Elektrisch',
        'color': 'Wit',
        'fuelType': 'elektrisch',
        'numberOfSeats': 4,
        'location': 'Amundsenweg 25',
        'latitude': 51.4874937,
        'longitude': 3.8726348,
        'advertisement': 'Ervaar 100% elektrisch rijden op Zeeuwse Groene Stroom! Deze auto accelereert heel snel en is een ervaring om in te mogen rijden!\n\n\nErvaar 100% elektrisch rijden op Zeeuwse Groene Stroom! Deze auto accelereert heel snel en is een ervaring om in te mogen rijden!\n\n',
        'refuelByRenter': false,
        'price': {
          'id': 3015,
          'hourRate': '2.50',
          'kilometerRate': '0.13',
          'fuelPerKilometer': '0.00',
          'kmFree': false,
          'dayRateTotal': '25.00',
          'insuranceRate': '0.125',
          'insuranceFee': null,
          'type': 'common'
        },
        'hourRate': null,
        'kilometerRate': null,
        'fuelPerKilometer': null,
        'kmFree': null,
        'dayRateTotal': null,
        'maxHours': null,
        'insuranceRate': null,
        'insuranceFee': null,
        'contactPersonId': null,
        'owner': {
          'id': 500863,
          'slug': 'kyoto',
          'preference': 'owner',
          'firstName': 'Niels',
          'city': 'Heinkenszand'
        },
        'ownerId': 500863,
        'numberOfBookings': 5,
        'city': 'Goes',
        'pictures': [{
          'id': 5472,
          'url': 'resource\/180x120\/52cd06acedb26.jpeg',
          'large': 'resource\/500x330\/52cd06acedb26.jpeg',
          'normal': 'resource\/180x120\/52cd06acedb26.jpeg',
          'small': 'resource\/140x90\/52cd06acedb26.jpeg',
          'order': 0
        }, {
          'id': 5473,
          'url': 'resource\/180x120\/52cd06ba7fca6.jpeg',
          'large': 'resource\/500x330\/52cd06ba7fca6.jpeg',
          'normal': 'resource\/180x120\/52cd06ba7fca6.jpeg',
          'small': 'resource\/140x90\/52cd06ba7fca6.jpeg',
          'order': 1
        }],
        'locktype': 'meeting',
        'locktypes': null,
        'response_accept': 6,
        'rating_totals': null
      }, {
        'contactPerson': {
          'id': 502178
        },
        'fleet': {
          'id': 1
        },
        'id': 20,
        'providerId': 1,
        'alias': 'Leaf LomboXnet',
        'carOptions': null,
        'brand': 'NISSAN',
        'model': 'Leaf',
        'color': 'Lichtblauw',
        'fuelType': 'elektrisch',
        'numberOfSeats': 5,
        'location': 'Jan Pieterszoon Coenstraat 7-BIS',
        'latitude': 52.0894,
        'longitude': 5.09826,
        'advertisement': 'G\u00c9\u00c9N BRANDSTOFKOSTEN!!\nDe Nissan Leaf is een 100% elektrische auto. Het rijdt fantastisch en het is een zeer luxe auto. De maximale afstand die je (zonder opladen) af kan leggen ligt tussen de 90 en 100 km. Dit hangt af van hoe hard je rijdt. De auto is voorzien van laadpassen voor snel en gewoon laden. Overleg altijd even met ons als je afstanden boven de 100 km wil afleggen. Wij hebben daar zelf inmiddels ruime ervaring mee.\n\nRoken en huisdieren in de auto zijn niet toegestaan.\n\nDirect beschikbaarheid checken? Sms naar 06-41412222',
        'refuelByRenter': false,
        'price': {
          'id': 3805,
          'hourRate': '4.00',
          'kilometerRate': '0.10',
          'fuelPerKilometer': '0.00',
          'kmFree': true,
          'dayRateTotal': '40.00',
          'insuranceRate': '0.125',
          'insuranceFee': null,
          'type': 'common'
        },
        'hourRate': null,
        'kilometerRate': null,
        'fuelPerKilometer': null,
        'kmFree': null,
        'dayRateTotal': null,
        'maxHours': null,
        'insuranceRate': null,
        'insuranceFee': null,
        'contactPersonId': 502178,
        'owner': {
          'id': 502178,
          'slug': 'lomboxnet',
          'preference': 'both',
          'firstName': 'Robin',
          'city': 'Utrecht'
        },
        'ownerId': 502178,
        'numberOfBookings': 70,
        'city': 'Utrecht',
        'pictures': [{
          'id': 4624,
          'url': 'resource\/180x120\/resource20_2.JPG',
          'large': 'resource\/500x330\/resource20_2.JPG',
          'normal': 'resource\/180x120\/resource20_2.JPG',
          'small': 'resource\/140x90\/resource20_2.JPG',
          'order': 0
        }],
        'locktype': 'meeting',
        'locktypes': null,
        'response_accept': 80,
        'rating_totals': null
      }],
      'id': 0
    };

    $scope.resources_slider = mock.result;

    $scope.gotoProfile = function (resource) {
      $state.go('owm.resource.show', {
        city: resource.city,
        resourceId: resource.id
      });
    };
  }

  $scope.search = {
    text: ''
  };

  $scope.doSearch = function (placeDetails) {
    if (placeDetails) {
      resourceQueryService.setText($scope.search.text);
      resourceQueryService.setLocation({
        latitude: placeDetails.geometry.location.lat(),
        longitude: placeDetails.geometry.location.lng()
      });
    }
    $state.go('owm.resource.search.list', resourceQueryService.createStateParams());
  };

  $scope.version = VERSION;
});
