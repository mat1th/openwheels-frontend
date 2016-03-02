'use strict';

angular.module( 'owm.auth', [
  'owm.auth.signup',
  'owm.auth.forgotPassword',
  'owm.auth.resetPassword',
  'owm.auth.alterPassword'
])

.config(function config($stateProvider) {

  $stateProvider

  .state('signup', {
    parent: 'base',
    url: '/signup?preference',
    views: {
      'main@shell':{
        templateUrl: 'auth/signup/auth-signup.tpl.html',
        controller: 'AuthSignupController'
      }
    },
    data: {
      title: 'META_SIGNUP_TITLE',
      description: 'META_SIGNUP_DESCRIPTION',
      access: { deny: { authenticated: true } }
    }
  })

  .state('owm.auth', {
    abstract: true
  })

  .state('owm.auth.forgotPassword', {
    url: '/forgot-password',
    views: {
      'main@shell': {
        templateUrl: 'auth/forgotPassword/forgotPassword.tpl.html',
        controller : 'ForgotPasswordController'
      }
    }
  })

  /**
   * RE-SET YOUR PASSWORD USING A CODE
   * Users receive a link to this page by email
   * No authentication required.
   */
  .state('owm.auth.resetPassword', {
    url: '/reset-password/:code',
    views: {
      'main@shell': {
        templateUrl: 'auth/resetPassword/resetPassword.tpl.html',
        controller : 'ResetPasswordController'
      }
    },
    resolve: {
      code: ['$stateParams', function ($stateParams) {
        return $stateParams.code;
      }],
    }
  })

  /**
   * CHOOSE A NEW PASSWORD
   * Authentication required
   */
  .state('owm.auth.changePassword', {
    url: '/change-password',
    views: {
      'main@shell': {
        templateUrl: 'auth/alterPassword/alterPassword.tpl.html',
        controller : 'AlterPasswordController'
      }
    },
    data: {
      access: { deny : { anonymous : true } }
    },
    resolve: {
      me: ['authService', function (authService) {
        return authService.authenticatedUser();
      }]
    }
  })

  .state('owm.auth.validateEmail', {
    url: '/email/:personId/validate/:code',
    onEnter: ['$state', '$stateParams', '$timeout', '$translate', 'alertService', 'personService',
    function ( $state ,  $stateParams ,  $timeout ,  $translate ,  alertService ,  personService) {

      var personId = $stateParams.personId;
      var code     = $stateParams.code;

      alertService.load();
      personService.validateEmail({
        person: personId,
        hash  : code
      })
      .then(function () {
        alertService.add('success', $translate.instant('AUTH_EMAIL_VALIDATE_SUCCESS'), 8000);
      })
      .catch(function (err) {
        alertService.addError(err);
      })
      .finally(function () {
        alertService.loaded();
        $timeout(function () {
          $state.go('owm.person.profile');
        });
      });
    }]
  })
  ;

})
;
