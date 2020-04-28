//////////////////
// BUDGET CONTROLLER
///////////////////

var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;

        data.allItems[type].forEach((cur) => {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            var allItemsArr = data.allItems[type]; //Select the correct array according the type

            //Create new ID
            if (allItemsArr.length > 0) {
                ID = allItemsArr[allItemsArr.length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create new 'inc' or 'exp'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push the new element to data structure
            allItemsArr.push(newItem);

            //return new Item
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            // calculate the totals
            calculateTotal('inc');
            calculateTotal('exp');

            //calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    };

})();


////////////////
// UI CONTROLLER
////////////////

var UIController = (function () {

    //Storing all DOMstrings in one place so future updating will be easier
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage'
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHTML, element;

            //Create HTML string with placeholder
            if (type === 'exp') {
                //Expense html
                element = DOMStrings.expensesContainer;
                newHTML = `<div class="item clearfix" id="exp-${ obj.id }"><div class="item__description">${ obj.description }</div><div class="right clearfix"><div class="item__value">- ${ obj.value.toFixed(2) } €</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            } else if (type === 'inc') {
                //Income html
                element = DOMStrings.incomeContainer;
                newHTML = `<div class="item clearfix" id="inc-${ obj.id }"><div class="item__description">${ obj.description }</div><div class="right clearfix"><div class="item__value">+ ${ obj.value.toFixed(2) } €</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            }

            //replace HTML text with actual data
            // newHTML = html.replace('%id%', obj.id);
            // newHTML = newHTML.replace('%description%', obj.description);
            // newHTML = newHTML.replace('%value%', obj.value);

            //insert the HTML to the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
        },

        deleteListItem: function(id) {
            
            var el = document.getElementById(id);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fields.forEach((current) => {
                current.value = "";
            });

            fields[0].focus();
        },

        displayBudget: function (obj) {

            document.querySelector(DOMStrings.budgetLabel).textContent = `${ obj.budget.toFixed(2) } €`;
            document.querySelector(DOMStrings.incomeLabel).textContent = `+ ${ obj.totalInc.toFixed(2) } €`;
            document.querySelector(DOMStrings.expensesLabel).textContent = `- ${ obj.totalExp.toFixed(2) } €`;

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = `${ obj.percentage }%`;
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            var NodelistForEach = function(list, callback) {
                for(var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            NodelistForEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },

        getDOMStrings: function () {
            return DOMStrings;
        }
    };

})();


////////////////
// APP CONTROLLER
////////////////

var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keydown', function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                e.preventDefault();
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    };


    var updateBudget = function () {

        //Calculate the budget
        budgetCtrl.calculateBudget();

        //Return the budget
        var budget = budgetCtrl.getBudget();

        //Display the budget on the UI
        UICtrl.displayBudget(budget);


    };

    var updatePercentages = function() {
        // Calculate the percentage
        budgetCtrl.calculatePercentages();

        // Read the value from budget controller
        var percentages = budgetCtrl.getPercentages();

        // Update the UI
        UICtrl.displayPercentages(percentages);
    };


    var ctrlAddItem = function () {
        var input, newItem;

        //1. Get the field input data
        input = UICtrl.getInput();

        //prevent empty inputs
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. calculate and update the budget
            updateBudget();

            //6. Update the percentage
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //Update and show new budget
            updateBudget();

            //Update the percentage
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log('started');
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    };
})(budgetController, UIController);

controller.init();