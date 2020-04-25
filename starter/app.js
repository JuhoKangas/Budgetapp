//////////////////
// BUDGET CONTROLLER
///////////////////

var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
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
        percentageLabel: '.budget__expenses--percentage'
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
                newHTML = `<div class="item clearfix" id="expense-${ obj.id }"><div class="item__description">${ obj.description }</div><div class="right clearfix"><div class="item__value">${ obj.value.toFixed(2) } €</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            } else if (type === 'inc') {
                //Income html
                element = DOMStrings.incomeContainer;
                newHTML = `<div class="item clearfix" id="income-${ obj.id }"><div class="item__description">${ obj.description }</div><div class="right clearfix"><div class="item__value">${ obj.value.toFixed(2) } €</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            }

            //replace HTML text with actual data
            // newHTML = html.replace('%id%', obj.id);
            // newHTML = newHTML.replace('%description%', obj.description);
            // newHTML = newHTML.replace('%value%', obj.value);

            //insert the HTML to the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
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
            document.querySelector(DOMStrings.incomeLabel).textContent = `${ obj.totalInc.toFixed(2) } €`;
            document.querySelector(DOMStrings.expensesLabel).textContent = `${ obj.totalExp.toFixed(2) } €`;

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = `${ obj.percentage }%`;
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

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
    };


    var updateBudget = function () {

        //Calculate the budget
        budgetCtrl.calculateBudget();

        //Return the budget
        var budget = budgetCtrl.getBudget();

        //Display the budget on the UI
        UICtrl.displayBudget(budget);
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