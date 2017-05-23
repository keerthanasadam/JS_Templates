var budgetController = (function(){
    
    var Expense = function(id, description, value){
        
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
     var Income = function(id, description, value){
        
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotals = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
          
          sum = sum + cur.value;
        });
        
        data.totals[type] = sum;
        
    };
    
    var data = {
        
        allItems: {    
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        
        addItem: function(type, des, val){
            var newItem, ID;
            
            //[1 2 3 4 5] , next ID =6
            // if we delete any item in middle then [1 2 4 5 6] , next Id should be 7 
            //Id = last id + 1
            
            
            if(data.allItems[type].length > 0){   
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }else{
                ID = 0;
            }
            
            //Creating a new item based on type
            if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }
            
            //pushing new items to data structure
            data.allItems[type].push(newItem);
            
            //returning the newItem
            return newItem;
        },
        
        calculateBudget: function(){
            
            //1.calculate income and expenses
            
            calculateTotals('exp');
            calculateTotals('inc');
            
            //2.calculate budget
            
            data.budget = data.totals.inc - data.totals.exp;
            
            //3. calculate percentage
            
            if(data.totals.inc > 0){
                  data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
            }else{
                
                data.percentage = -1;
            }
        },
        
        getBudget: function(){
            
            return {
                
                budget: data.budget,
                percentage: data.percentage,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp
                
            };
            
        },
        
        testing: function(){
            
            console.log(data);
        }
        
    }
    
    
    
    
})();


var uiController =(function(){
 
    var DOMStrings = {
        
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage'
        
    };
    
    return{
         getInput: function(){
            return {
                        type: document.querySelector(DOMStrings.inputType).value,
                        description: document.querySelector(DOMStrings.inputDescription).value,
                        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        
        addListItem: function(obj,type){
            
            var html, newHtml, element;
            
            //create HTML string with placeholder text
            if(type === 'inc'){
                
                element = DOMStrings.incomeContainer;
                
                 html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div>  <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
            
            else if (type === 'exp'){
                   
                element = DOMStrings.expenseContainer;

                html = '<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
                
            }
        
            //replace placeholder text with original data 
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            //Insert HTML data into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
        },
        
        clearFields: function(){
            
            var fields, fieldsArr;
            
            //returns list
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            
            //convert list to array using call()
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
                
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
        
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalIncome;
            document.querySelector(DOMStrings.expenseLabel).textContent = obj.totalExpense;
            
            if(obj.percentage > 0){
             document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';   
            }else{
                
                   document.querySelector(DOMStrings.percentageLabel).textContent = '--';
            }
            
            
        },
        
        
        getDOMStrings: function(){
    
            return DOMStrings;
        }           
    };
    
})();


//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, uiCtrl){
    
    var setupEventListeners = function(){
        
        var DOM = uiCtrl.getDOMStrings(); 
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
        if(event.keyCode === 13 || event.which === 13){         
            ctrlAddItem();
        }
            
        });
        
    };
    
    
    var updateBudget = function(){
        
        //1.calculate the budget
        budgetCtrl.calculateBudget();
        
        //2.return the budget
        var budget = budgetCtrl.getBudget();
        
        //3.display the budget on the UI
        uiCtrl.displayBudget(budget);
    };
    
    var ctrlAddItem = function(){
        var newItem, input;
        
        //1. Get input data
        
        var input = uiCtrl.getInput();
        
        //2. Add data to data structure.
        
        if(input.description !== "" && !isNaN(input.value) && input.value>0){
           
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        //3. Display data items on UI
        
        uiCtrl.addListItem(newItem, input.type);
        
        //4. Clear input fields
        
        uiCtrl.clearFields();
            
        //5.calculate and update budget
        updateBudget();
        
        }
    };
    
    return {
        
        init: function(){
            
            console.log('Application started');
             uiCtrl.displayBudget({
                
                budget: 0,
                percentage: 0,
                totalIncome: 0,
                totalExpense: 0
                
            });
            setupEventListeners();
        }
    };
    
    
})(budgetController, uiController);

controller.init();