(function() {
	'use strict';
	angular.module('app').controller('TradeCtrl', TradeCtrl);

	TradeCtrl.$inject = ['$stateParams', 'TradeSvc', '$location'];


	function TradeCtrl($stateParams, TradeSvc, $location) {
		var vm = this;   
		vm.copyTradeType=copyTradeType;
		vm.removeDocument=removeDocument;
		vm.removeDataItem=removeDataItem;
		vm.save=save;

		getTrades();   
		loadTradeTypes();

		function loadTradeTypes(){

			TradeSvc.getTypes().then(function(resp){
				vm.tradeTypes = resp;
			});
		}

		function getTrades() {
			vm.tradeId = $stateParams.id;
			vm.projectId = $stateParams.projectId;
			vm.fundId = $stateParams.fundId;
			
			if (vm.tradeId && vm.tradeId !== 'new'){
				TradeSvc.getTrade(vm.tradeId).then(function(resp){
					vm.trade=resp;  
					if(!vm.trade.Documents){
						vm.trade.Documents = [];
					} 
					vm.trade.Documents.push({'NewRow': true});
					if(!vm.trade.Data){
						vm.trade.Data = [];
					}
					vm.trade.Data.push({'NewRow': true});         
					
				});
			}

		}

		function copyTradeType(){
			vm.tradeTypes.forEach(function(item){
				if(item.EntityID === vm.selectedTradeType){
					vm.trade = angular.copy(item);
					delete vm.trade.EntityID;
					vm.trade.FundID = vm.fundId;
					vm.trade.Data.push({'NewRow': true});
					vm.trade.Documents.push({'NewRow': true});
				}
			});
		}

		function removeDocument(id) {
			var trade = vm.trade.EntityID ? angular.copy(vm.trade) : vm.trade;
			trade.Documents.splice(id, 1);
			if (trade.EntityID) {
				save(trade,'remove');      
			}
		}


		function removeDataItem(id) {
			var trade = vm.trade.EntityID ? angular.copy(vm.trade) : vm.trade;
			trade.Data.splice(id, 1);
			if (trade.EntityID) {
				save(trade,'remove');      
			}
		}

		function save(inputTrade,addOrRemoveFlag) { 
			var trade = inputTrade || vm.trade;   
			var documents = [];
			trade.Documents.forEach(function(item){
				if(item.NewRow){
					delete item.NewRow;
				}
				if(item.Name){
					documents.push(item);
				}
			});
			trade.Documents = documents;
			var data = [];
			trade.Data.forEach(function(item){
				if(item.NewRow){
					delete item.NewRow;
				}
				if(item.Name){
					data.push(item);
				}
			});
			trade.Data = data;
			TradeSvc.saveTrade(trade).then(function() {				
				if(!addOrRemoveFlag){
					$location.path('/app/projects/'+vm.projectId+'/funds/'+vm.fundId);
				} else{
					getTrades();
				}				
			});     
		}
	}
})();