'use strict';

// see https://github.com/ablanco/jquery.pwstrength.bootstrap

angular.module('passwordStrengthDirective', [])

.directive('passwordStrength', function () {
  return {
    restrict: 'A',
    link: function (scope, elm, attrs) {

      var rules = {
        activated: {
          wordNotEmail: false, //
          wordLength: true,
          wordSimilarToUsername: false, //
          wordSequences: false, //
          wordTwoCharacterClasses: false, //
          wordRepetitions: false, //
          wordLowercase: true,
          wordUppercase: true,
          wordOneNumber: true,
          wordThreeNumbers: true,
          wordOneSpecialChar: true,
          wordTwoSpecialChar: true,
          wordUpperLowerCombo: true,
          wordLetterNumberCombo: true,
          wordLetterNumberCharCombo: true
        },
        scores: {
          wordNotEmail: -100,
          wordLength: -50,
          wordSimilarToUsername: -100,
          wordSequences: -50,
          wordTwoCharacterClasses: 2,
          wordRepetitions: -25,
          wordLowercase: 1, // 1 per letter
          wordUppercase: 3, // 3 per letter

          wordOneNumber: 3, // 3
          wordThreeNumbers: 5,

          wordOneSpecialChar: 6, // 3
          wordTwoSpecialChar: 5, // 5

          wordUpperLowerCombo: 4, // 2
          wordLetterNumberCombo: 6, // 2
          wordLetterNumberCharCombo: 6 // 2
        }
      };

      var common = {
        minChar: 6,
        debug: true
      };

      var ui = {
        showErrors: true,
        showProgressBar: true,
        showVerdictsInsideProgressBar: true,

        errorMessages: {
          wordLength: 'We adviseren een wachtwoord van tenminste 8 tekens',
          wordNotEmail: 'Do not use your email as your password',
          wordSimilarToUsername: 'Your password cannot contain your username',
          wordTwoCharacterClasses: 'Use different character classes',
          wordRepetitions: 'Too many repetitions',
          wordSequences: 'Your password contains sequences'
        },

        verdicts: ['Zwak', 'Matig', 'Normaal', 'Sterk', 'Zeer sterk'],
        // scores: [17, 26, 40, 50] --> DEFAULT,
        scores: [17, 24, 30, 40],

        spanError: function (options, key) {
          var msg = options.ui.errorMessages[key];
          if (!msg) { return ''; }
          return '<span class="help-block text-danger">' + msg + '</span>';
        }
      };

      elm.pwstrength({
        common: common,
        rules : rules,
        ui    : ui
      });
    }
  };
})
;
