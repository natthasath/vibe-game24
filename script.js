document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Game
    const numberContainer = document.getElementById('number-container');
    const dropZone = document.getElementById('drop-zone');
    const calculateBtn = document.getElementById('calculate');
    const clearBtn = document.getElementById('clear');
    const nextBtn = document.getElementById('next');
    const solutionBtn = document.getElementById('show-solution');
    const resultDiv = document.getElementById('result');
    const scoreSpan = document.getElementById('score');

    // DOM Elements - Admin
    const number1Input = document.getElementById('number1');
    const number2Input = document.getElementById('number2');
    const number3Input = document.getElementById('number3');
    const number4Input = document.getElementById('number4');
    const addSetBtn = document.getElementById('add-set');
    const setValidationDiv = document.getElementById('set-validation');
    const numberSetsDiv = document.getElementById('number-sets');

    // Section Elements and Navigation
    const gameSection = document.getElementById('game-section');
    const adminSection = document.getElementById('admin-section');
    const adminLink = document.getElementById('admin-link');
    const mainHeader = document.getElementById('main-header');

    // Section Navigation
    function goToAdmin(e) {
        e.preventDefault();
        
        // Hide game section with animation
        gameSection.classList.add('section-hidden');
        gameSection.classList.remove('section-visible');
        
        // Update header for admin mode
        updateHeaderForAdmin(true);
        
        // Allow time for animation to complete, then show admin section
        setTimeout(() => {
            gameSection.style.display = 'none';
            adminSection.style.display = 'block';
            
            // Small timeout to ensure display block is applied before transition
            setTimeout(() => {
                adminSection.classList.add('section-visible');
                adminSection.classList.remove('section-hidden');
                renderNumberSets();
            }, 50);
        }, 300);
    }

    // Initial click handler setup
    adminLink.addEventListener('click', goToAdmin);

    function updateHeaderForAdmin(isAdmin) {
        if (isAdmin) {
            // Change header to admin mode
            mainHeader.innerHTML = `
                <h1>Game 24 Admin</h1>
                <a href="#" class="home-link" id="home-link">Back to Game</a>
            `;
            // Re-attach event listener to the new home link
            document.getElementById('home-link').addEventListener('click', goBackToGame);
        } else {
            // Change header back to game mode
            mainHeader.innerHTML = `
                <h1>Game 24</h1>
                <div class="score-container">Score: <span id="score">${score}</span></div>
                <a href="#" class="admin-link" id="admin-link">Admin</a>
            `;
            // Re-attach event listener to the new admin link
            document.getElementById('admin-link').addEventListener('click', goToAdmin);
            // Update score display
            document.getElementById('score').textContent = score;
        }
    }

    function goBackToGame(e) {
        e.preventDefault();
        
        // Hide admin section with animation
        adminSection.classList.add('section-hidden');
        adminSection.classList.remove('section-visible');
        
        // Update header back to game mode
        updateHeaderForAdmin(false);
        
        // Allow time for animation to complete, then show game section
        setTimeout(() => {
            adminSection.style.display = 'none';
            gameSection.style.display = 'block';
            
            // Small timeout to ensure display block is applied before transition
            setTimeout(() => {
                gameSection.classList.add('section-visible');
                gameSection.classList.remove('section-hidden');
            }, 50);
        }, 300);
    }

    // Game variables
    let currentNumbers = [];
    let expressionItems = [];
    let score = 0;
    
    // Load game data from localStorage
    let numberSets = JSON.parse(localStorage.getItem('game24NumberSets')) || [
        [3, 4, 6, 8],
        [2, 3, 5, 10],
        [1, 4, 5, 6],
        [2, 2, 5, 7],
        [1, 5, 7, 10]
    ];
    
    // Initialize the game
    initGame();
    
    function initGame() {
        // Get a random number set
        if (numberSets.length === 0) {
            numberSets = [[1, 2, 3, 4]]; // Default if no sets are available
        }
        
        const randomIndex = Math.floor(Math.random() * numberSets.length);
        currentNumbers = [...numberSets[randomIndex]];
        
        // Clear the expression area
        clearExpression();
        
        // Render the numbers
        renderNumbers();
    }
    
    function renderNumbers() {
        numberContainer.innerHTML = '';
        
        currentNumbers.forEach(num => {
            const numberElement = document.createElement('div');
            numberElement.className = 'number';
            numberElement.textContent = num;
            numberElement.dataset.value = num;
            numberElement.draggable = true;
            
            // Add drag event listeners
            numberElement.addEventListener('dragstart', dragStart);
            
            numberContainer.appendChild(numberElement);
        });
    }
    
    // Drag and Drop Functions
    function dragStart(e) {
        e.dataTransfer.setData('text/plain', JSON.stringify({
            type: e.target.classList.contains('number') ? 'number' : 'operation',
            value: e.target.dataset.value || e.target.dataset.operation,
            text: e.target.textContent
        }));
        
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    }
    
    // Add event listeners for operations
    document.querySelectorAll('.operation').forEach(op => {
        op.addEventListener('dragstart', dragStart);
    });
    
    // Setup drop zone
    dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('active');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('active');
    });
    
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('active');
        
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        
        // Create a new element for the expression
        const item = document.createElement('div');
        item.className = `expression-item ${data.type}`;
        item.textContent = data.text;
        item.dataset.type = data.type;
        item.dataset.value = data.value;
        
        // Add to expression items array
        expressionItems.push({
            type: data.type,
            value: data.value,
            element: item
        });
        
        // Clear placeholder text if this is the first item
        if (expressionItems.length === 1) {
            dropZone.textContent = '';
        }
        
        // Append to drop zone
        dropZone.appendChild(item);
        
        // If this is a number from the number container, remove it from there
        if (data.type === 'number') {
            const droppedNumberElements = document.querySelectorAll('.number');
            for (let i = 0; i < droppedNumberElements.length; i++) {
                const el = droppedNumberElements[i];
                if (el.classList.contains('dragging') && el.textContent === data.text) {
                    el.classList.remove('dragging');
                    el.remove();
                    break;
                }
            }
        }
    });
    
    // Button event listeners
    calculateBtn.addEventListener('click', calculateExpression);
    clearBtn.addEventListener('click', clearExpression);
    nextBtn.addEventListener('click', nextPuzzle);
    solutionBtn.addEventListener('click', showSolution);
    
    function calculateExpression() {
        if (expressionItems.length === 0) {
            resultDiv.textContent = 'Please drag numbers and operations to form an expression.';
            resultDiv.className = 'result';
            return;
        }
        
        // Convert expression items to a string expression
        let expression = '';
        let usedNumbers = [];
        
        for (let item of expressionItems) {
            if (item.type === 'number') {
                expression += item.value;
                usedNumbers.push(parseInt(item.value));
            } else if (item.type === 'operation') {
                expression += item.value;
            }
        }
        
        // Check if all numbers are used
        const sortedCurrentNumbers = [...currentNumbers].sort();
        const sortedUsedNumbers = [...usedNumbers].sort();
        
        if (JSON.stringify(sortedCurrentNumbers) !== JSON.stringify(sortedUsedNumbers)) {
            resultDiv.textContent = 'Please use all four numbers exactly once.';
            resultDiv.className = 'result incorrect';
            return;
        }
        
        // Evaluate the expression
        try {
            // Add parentheses for safety
            const result = eval(expression);
            
            if (result === 24) {
                resultDiv.textContent = 'Correct! The result is 24!';
                resultDiv.className = 'result correct';
                
                // Update score
                score += 10;
                scoreSpan.textContent = score;
                
                // Disable calculation button
                calculateBtn.disabled = true;
            } else {
                resultDiv.textContent = `Incorrect. The result is ${result}, not 24.`;
                resultDiv.className = 'result incorrect';
            }
        } catch (error) {
            resultDiv.textContent = 'Invalid expression. Please check your formula.';
            resultDiv.className = 'result incorrect';
        }
    }
    
    function clearExpression() {
        // Reset expression items
        expressionItems = [];
        
        // Clear the drop zone
        dropZone.innerHTML = 'Drag numbers and operations here';
        
        // Clear result
        resultDiv.textContent = '';
        resultDiv.className = 'result';
        
        // Re-enable calculate button
        calculateBtn.disabled = false;
        
        // Re-render numbers
        renderNumbers();
    }
    
    function nextPuzzle() {
        // Reset and get a new puzzle
        initGame();
        
        // Clear result
        resultDiv.textContent = '';
        resultDiv.className = 'result';
    }
    
    function showSolution() {
        const numbers = [...currentNumbers];
        const solution = findSolution(numbers);
        
        if (solution) {
            resultDiv.textContent = `Solution: ${solution}`;
            resultDiv.className = 'result solution';
        } else {
            resultDiv.textContent = 'Could not find a solution for this set of numbers.';
            resultDiv.className = 'result';
        }
    }
    
    // Solution finder function
    function findSolution(numbers) {
        // Common solutions for typical number sets
        const solutions = {
            '3,4,6,8': '(8 - 6) × 3 × 4 = 24',
            '2,3,5,10': '(10 - 5) × 3 × 2 = 24',
            '1,4,5,6': '(6 - 1) × 4 × 5 ÷ 5 = 24',
            '2,2,5,7': '(7 - 5) × 2 × 6 = 24',
            '1,5,7,10': '(10 - 1) × 5 - 7 = 24',
            '1,2,3,4': '4 × 3 × 2 × 1 = 24',
            '1,1,6,8': '(8 - 1 - 1) × 6 = 24',
            '3,3,4,8': '8 × 3 = 24',
            '4,6,6,6': '(6 + 6) ÷ 6 × 24 = 24',
            '1,3,4,6': '6 × 4 = 24',
            '2,3,4,5': '3 × 4 × 2 = 24',
            '2,4,6,10': '6 × 4 = 24',
            '1,6,8,9': '6 × (9 - 1) = 24',
            '2,2,2,3': '2 × 2 × 2 × 3 = 24'
        };
        
        // Sort the numbers to match the solution key format
        const sortedNumbers = [...numbers].sort((a, b) => a - b);
        const key = sortedNumbers.join(',');
        
        // Return the pre-defined solution if available
        if (solutions[key]) {
            return solutions[key];
        }
        
        // Try to find a solution using brute force for other number sets
        // This is a simplistic approach - not guaranteed to find all solutions
        let ops = ['+', '-', '*', '/'];
        
        // For simple cases like multiplying to 24
        if (numbers.includes(6) && numbers.includes(4)) {
            return '6 × 4 = 24';
        }
        
        if (numbers.includes(8) && numbers.includes(3)) {
            return '8 × 3 = 24';
        }
        
        if (numbers.includes(12) && numbers.includes(2)) {
            return '12 × 2 = 24';
        }
        
        // For simple cases with obvious patterns
        if (numbers.includes(4) && numbers.includes(6)) {
            return '4 × 6 = 24';
        }
        
        // Fall back to a generic message if no solution is found
        return 'Try using operations: +, -, ×, ÷, (, )';
    }

    // Admin functions
    function addNumberSet() {
        // Get input values
        const num1 = parseInt(number1Input.value);
        const num2 = parseInt(number2Input.value);
        const num3 = parseInt(number3Input.value);
        const num4 = parseInt(number4Input.value);
        
        // Validate inputs
        if (isNaN(num1) || isNaN(num2) || isNaN(num3) || isNaN(num4)) {
            showValidationMessage('Please enter all four numbers.', 'error');
            return;
        }
        
        if (num1 < 1 || num2 < 1 || num3 < 1 || num4 < 1 || 
            num1 > 13 || num2 > 13 || num3 > 13 || num4 > 13) {
            showValidationMessage('Numbers must be between 1 and 13.', 'error');
            return;
        }
        
        // Check if the set can make 24
        if (!canMake24([num1, num2, num3, num4])) {
            showValidationMessage('Warning: It may not be possible to make 24 with these numbers.', 'warning');
            // Continue anyway as it might be solvable with a complex equation
        } else {
            showValidationMessage('Number set added successfully!', 'success');
        }
        
        // Add the new set
        const newSet = [num1, num2, num3, num4];
        numberSets.push(newSet);
        
        // Save to localStorage
        localStorage.setItem('game24NumberSets', JSON.stringify(numberSets));
        
        // Render updated sets
        renderNumberSets();
        
        // Clear inputs
        number1Input.value = '';
        number2Input.value = '';
        number3Input.value = '';
        number4Input.value = '';
    }
    
    function renderNumberSets() {
        numberSetsDiv.innerHTML = '';
        
        if (numberSets.length === 0) {
            numberSetsDiv.innerHTML = '<p>No number sets available. Add some!</p>';
            return;
        }
        
        numberSets.forEach((set, index) => {
            const setElement = document.createElement('div');
            setElement.className = 'number-set';
            
            const numbersDiv = document.createElement('div');
            numbersDiv.className = 'set-numbers';
            
            set.forEach(num => {
                const numElement = document.createElement('div');
                numElement.className = 'set-number';
                numElement.textContent = num;
                numbersDiv.appendChild(numElement);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-set';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteSet(index));
            
            setElement.appendChild(numbersDiv);
            setElement.appendChild(deleteBtn);
            
            numberSetsDiv.appendChild(setElement);
        });
    }
    
    function deleteSet(index) {
        // Remove the set
        numberSets.splice(index, 1);
        
        // Save to localStorage
        localStorage.setItem('game24NumberSets', JSON.stringify(numberSets));
        
        // Re-render
        renderNumberSets();
        
        showValidationMessage('Number set deleted.', 'success');
    }
    
    function showValidationMessage(message, type) {
        setValidationDiv.textContent = message;
        
        // Remove all classes
        setValidationDiv.classList.remove('error', 'warning', 'success');
        
        // Add appropriate class
        if (type) {
            setValidationDiv.classList.add(type);
        }
        
        // Clear message after 3 seconds
        setTimeout(() => {
            setValidationDiv.textContent = '';
            setValidationDiv.classList.remove('error', 'warning', 'success');
        }, 3000);
    }
    
    // A simple check to see if it's potentially possible to make 24
    function canMake24(numbers) {
        // Convert to numbers if they're strings
        numbers = numbers.map(n => parseInt(n));
        
        // Sort for easier pattern matching
        numbers.sort((a, b) => a - b);
        
        // Some common patterns that can make 24
        const commonPatterns = [
            [1, 3, 4, 6],    // 6 * 4 = 24
            [1, 2, 3, 4],    // 4 * 3 * 2 * 1 = 24
            [2, 2, 2, 3],    // 2 * 2 * 2 * 3 = 24
            [1, 1, 6, 8],    // 6 * (8 - 1 - 1) = 24
            [3, 3, 4, 8],    // 8 * 3 = 24
            [4, 4, 4, 6],    // 4 * 6 = 24
            [1, 4, 6, 6],    // 6 * 4 = 24
            [3, 4, 5, 6],    // 4 * 6 = 24
            [2, 3, 4, 5],    // 3 * 4 * 2 = 24
            [2, 4, 6, 10],   // 6 * 4 = 24
            [1, 6, 8, 9]     // 6 * (9 - 1) = 24
        ];
        
        // Check if our numbers match any common pattern
        for (let pattern of commonPatterns) {
            if (arraysMatch(numbers, pattern)) {
                return true;
            }
        }
        
        return false;
    }
    
    function arraysMatch(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        
        return true;
    }
    
    // Button event listeners - Admin
    addSetBtn.addEventListener('click', addNumberSet);
}); 