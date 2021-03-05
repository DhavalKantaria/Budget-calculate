console.log("Hello world");
console.log("Hello world");
// BUDGET CONTROLLER
var budgetController = (function(){
    
    var Expenses = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    
    var Incomes = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    Expenses.prototype.calcPer = function(totalIncome) {
        
        if(totalIncome > 0)
            this.percentage = Math.round((this.value / totalIncome) * 100);
        else    
            this.percentage = -1;
    }
    
    Expenses.prototype.getPer = function() {
        return this.percentage;
    }
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }
            
            if(type === 'inc'){
                newItem = new Incomes(ID, des, val);
            }
            else{
                newItem = new Expenses(ID, des, val);
            }
            
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        
        calulateBudget: function(type) {
            calculateTotal('inc');
            calculateTotal('exp');
            
            data.budget = data.totals.inc - data.totals.exp;
            
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else{
                data.percentage = -1;
            }
        },
        
        calcPercentage: function() {
            
            data.allItems.exp.forEach(function(cur) {
                cur.calcPer(data.totals.inc);
            });
            
        },
        
        getPercentage: function() {
            
            var per = data.allItems.exp.map(function(cur) {
                return cur.getPer();
            });
            
            return per;
            
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                incomeTotal: data.totals.inc,
                expenseTotal: data.totals.exp,
                per: data.percentage
            };
        },
        
        testing: function() {
            console.log(data);
        }
    }
    
})();



// UI CONTROLLER
var UIController = (function() {
    
    var DOMString = {
        inputType: '.add-type',
        inputDescription: '.add-description',
        inputValue: '.add-value',
        inputBtn: '.add-btn',
        incomeContainer: '.income-list',
        expenseContainer: '.expense-list',
        budgetLabel: '.budget-value',
        incomeLabel: '.budget-income--value',
        expenseLabel: '.budget-expense--value',
        percentageLabel: '.budget-expense--percentage',
        container: '.container',
        expPerLabel: '.item-percentage',
        dateLabel: '.budget-title--month'
    };
    
    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        
        num = Math.abs(num);
        num = num.toFixed(2);
        
        numSplit = num.split('.');
        
        int = numSplit[0];
        dec = numSplit[1];
        
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    
    var nodeListForEach = function(field, callback) {
                
        for(var i = 0; i < field.length; i ++){
            callback(field[i], i);
        }
                
    };
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMString.inputType).value,
                description: document.querySelector(DOMString.inputDescription).value,
                value: parseFloat(document.querySelector(DOMString.inputValue).value)
            }
        },  
        
        addListItem: function(obj, type) {
            
            var html, newHtml,  element;
            if(type === 'exp'){
                element = DOMString.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item-description">%description%</div><div class="right clearfix"><div class="item-value">%value%</div><div class="item-percentage">21%</div><div class="item-delete"><button class="item-delete-btn"><i class="fa fa-times" aria-hidden="true"></i></button></div></div></div>'
            }
            else if(type === 'inc'){
                element = DOMString.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item-description">%description%</div><div class="right clearfix"><div class="item-value">%value%</div><div class="item-delete"><button class="item-delete-btn"><i class="fa fa-times" aria-hidden="true"></i></button></div></div></div>'
            }
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        clearFields: function() {
            var field, fieldArr;
            
            field = document.querySelectorAll(DOMString.inputDescription + ', ' + DOMString.inputValue);
            
            fieldArr = Array.prototype.slice.call(field);
            fieldArr.forEach(function(current, index, array){
                 current.value = "";
            });
            
            field[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            if(obj.budget >= 0)
                type = 'inc';
            else    
                type = 'exp';
            
            document.querySelector(DOMString.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMString.incomeLabel).textContent = formatNumber(obj.incomeTotal, 'inc');
            document.querySelector(DOMString.expenseLabel).textContent = formatNumber(obj.expenseTotal, 'exp');
            
            if(obj.per > 0){
                document.querySelector(DOMString.percentageLabel).textContent = obj.per + '%';
            }
            else{
                document.querySelector(DOMString.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentage: function(per) {
            
            var fields = document.querySelectorAll(DOMString.expPerLabel);
            
            
            
            nodeListForEach(fields, function(current, i) {
                
                if(per[i] > 0){
                    current.textContent = per[i] + '%';
                }
                else{
                    current.textContent = '---';
                }
                
            });
            
        },
        
        displayMonth: function() {
            
            var now, year, month, monthArr;
            
            monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            
            document.querySelector(DOMString.dateLabel).textContent = monthArr[month] + ' ' + year;
            
        },
        
        changeType: function() {
            
            var fields = document.querySelectorAll(
                DOMString.inputType + ',' + 
                DOMString.inputDescription + ',' + 
                DOMString.inputValue
            );
            
            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMString.inputBtn).classList.toggle('red');
            
        },
        
        getDOM: function() {
            return DOMString;
        }
    };
    
})();



// APP CONTROLLER
var appController = (function(budgetCtrl, UICtrl) {
    
    var setupEventListener = function() {
        var DOM = UICtrl.getDOM();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13){
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
        
    };
    
    var updateBudget = function() {
        budgetCtrl.calulateBudget();
        
        var budget = budgetCtrl.getBudget();
        //console.log(budget);
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentage = function() {
          
        budgetCtrl.calcPercentage();
        
        var percentages = budgetCtrl.getPercentage();
        
        UICtrl.displayPercentage(percentages);
        
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            UICtrl.addListItem(newItem, input.type);

            UICtrl.clearFields();

            updateBudget();
            
            updatePercentage();

        };
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }
        
        budgetCtrl.deleteItem(type, ID);
        
        UICtrl.deleteListItem(itemID);
        
        updateBudget();
        
        updatePercentage();
        
    };
    
    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                incomeTotal: 0,
                expenseTotal: 0,
                per: -1
            });
            setupEventListener();
        }
    }
    
})(budgetController, UIController);

appController.init();