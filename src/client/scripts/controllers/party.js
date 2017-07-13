(function() {
  'use strict';
  angular.module('documentApp').controller('PartyCtrl', PartyCtrl);

  PartyCtrl.$inject = ['$modalInstance'];

  function PartyCtrl($modalInstance) {
    var vm = this;    

    vm.party = {};

    vm.ok=ok;
    vm.cancel=cancel;

    function cancel(){
      $modalInstance.dismiss('cancel');
    }

    function ok(){            
      $modalInstance.close(vm.party);      
    }

  }
}).call(this);