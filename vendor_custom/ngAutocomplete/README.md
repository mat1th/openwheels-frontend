# angular-googleplaces-autocomplete 
#### Originally forked from ngAutocomplete by Will Palahnuk

A simple directive for adding google places autocomplete to a textbox element. 

Updated to now use ng-model, should work much better in forms. Can now set an initial value using ng-model. Using the ng-model to set the textbox value does not trigger the autocomplete query.

#### Now loads Google Places Library asynchronously
#### Emits `ngAutocomplete:details` when details loaded

Tested with angularjs - 1.2.4 - 1.3.4


## Examples

+ [Example Plunkers - Simple Usage](http://plnkr.co/edit/GE34ojss9xMGm0024FvM?p=preview)

+ [Example Plunkers - Advanced Usage](http://plnkr.co/edit/GF3nM3XfYX9El2w11pGo?p=preview)

## Installation

```
bower install angular-googleplaces-autocomplete
```

## Usage

Declare a dependency on the `ngAutocomplete` module
``` javascript
var app = angular.module('myModule', ['ngAutocomplete']);
```

Add the directive to a textbox

``` javascript
    <input type="text"  ng-autocomplete ng-model="autocomplete" options="options" details="details"/>
```

## Documentation

+ ng-model - autocomplete textbox value

+ details - more detailed autocomplete result, includes address parts, latlng, etc. (Optional)

+ options - configuration for the autocomplete (Optional)

    + types: type,        String, values can be 'geocode', 'establishment', '(regions)', or '(cities)'
	+ bounds: bounds,     Google maps LatLngBounds Object, biases results to bounds, but may return results outside these bounds
	+ country: country    String, ISO 3166-1 Alpha-2 compatible country code. examples; 'ca', 'us', 'gb'
    + watchEnter:         Boolean, true; on Enter select top autocomplete result. false(default); enter ends autocomplete  

example: 
``` javascript
options = {
types: '(cities)',
country: 'ca'
}
```

google places autocomplete info: https://developers.google.com/maps/documentation/javascript/places

## Repo Maintainer

**Tim Withers** (http://github.com/TimWithers)

## Original Author

**Will Palahnuk** (http://github.com/wpalahnuk)

## Credits

google places autocomplete https://developers.google.com/maps/documentation/javascript/places

## Copyright and license

    The MIT License

	Copyright (c) 2014 Will Palahnuk

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
