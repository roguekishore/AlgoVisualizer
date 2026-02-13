# Frontend Integration Guide - User Progress System

## 🚀 Quick Start

### 1. On App Startup (User Login)

```javascript
// Fetch all user progress and store in localStorage
async function loadUserProgress(userId) {
  try {
    const response = await fetch(`/api/progress?userId=${userId}`);
    const progressMap = await response.json();
    
    // Store in localStorage for O(1) lookup
    localStorage.setItem('userProgress', JSON.stringify(progressMap));
    localStorage.setItem('userId', userId);
    localStorage.setItem('lastSync', new Date().toISOString());
    
    console.log('Progress loaded:', Object.keys(progressMap).length, 'problems');
    return progressMap;
  } catch (error) {
    console.error('Failed to load progress:', error);
  }
}
```

---

## 🎨 Country Map Coloring

```javascript
// Get problem status for country coloring
function getProblemStatus(problemId) {
  const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
  
  if (progress[problemId]) {
    return progress[problemId].status; // "ATTEMPTED" or "SOLVED"
  }
  
  return 'NOT_STARTED';
}

// Apply color to country based on status
function getCountryColor(problemId) {
  const status = getProblemStatus(problemId);
  
  switch(status) {
    case 'SOLVED':
      return '#10b981'; // Green
    case 'ATTEMPTED':
      return '#f59e0b'; // Orange
    case 'NOT_STARTED':
      return '#6b7280'; // Gray
    default:
      return '#6b7280';
  }
}

// Example: Color SVG country paths
countries.forEach(country => {
  const problemId = countryToProblemMap[country.id];
  const color = getCountryColor(problemId);
  country.element.style.fill = color;
});
```

---

## 📋 Problem List with Filters

```javascript
// Fetch problems with user status
async function fetchProblems(filters = {}) {
  const userId = localStorage.getItem('userId');
  const params = new URLSearchParams({
    userId: userId,
    page: filters.page || 0,
    size: filters.size || 20,
    sort: filters.sort || 'title,asc',
    ...(filters.topic && { topic: filters.topic }),
    ...(filters.tag && { tag: filters.tag }),
    ...(filters.status && { status: filters.status })
  });
  
  const response = await fetch(`/api/problems?${params}`);
  return await response.json();
}

// Example: Get only solved problems
const solvedProblems = await fetchProblems({ status: 'SOLVED' });

// Example: Get attempted Array problems
const attemptedArrays = await fetchProblems({ 
  status: 'ATTEMPTED', 
  topic: 'Array' 
});

// Example: Get not started Medium problems
const notStartedMedium = await fetchProblems({ 
  status: 'NOT_STARTED',
  tag: 'MEDIUM'
});
```

---

## ✅ Mark Problem as Solved

```javascript
// When user completes a problem
async function completeProblem(problemId) {
  const userId = localStorage.getItem('userId');
  
  try {
    // Update backend
    const response = await fetch(
      `/api/progress/${problemId}/solve?userId=${userId}`,
      { method: 'POST' }
    );
    const updatedProgress = await response.json();
    
    // Update localStorage immediately
    const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    progress[problemId] = updatedProgress;
    localStorage.setItem('userProgress', JSON.stringify(progress));
    
    // Update UI
    updateCountryColor(problemId, 'SOLVED');
    showSuccessMessage('Problem marked as solved! 🎉');
    
    return updatedProgress;
  } catch (error) {
    console.error('Failed to mark as solved:', error);
  }
}
```

---

## 🔄 Mark Problem as Attempted

```javascript
// When user attempts a problem
async function attemptProblem(problemId) {
  const userId = localStorage.getItem('userId');
  
  try {
    const response = await fetch(
      `/api/progress/${problemId}/attempt?userId=${userId}`,
      { method: 'POST' }
    );
    const updatedProgress = await response.json();
    
    // Update localStorage
    const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    progress[problemId] = updatedProgress;
    localStorage.setItem('userProgress', JSON.stringify(progress));
    
    // Update UI
    updateCountryColor(problemId, 'ATTEMPTED');
    
    return updatedProgress;
  } catch (error) {
    console.error('Failed to mark as attempted:', error);
  }
}
```

---

## 📊 Display User Statistics

```javascript
// Fetch and display user stats
async function loadUserStats() {
  const userId = localStorage.getItem('userId');
  
  const response = await fetch(`/api/progress/stats?userId=${userId}`);
  const stats = await response.json();
  
  // Update UI
  document.getElementById('solved-count').textContent = stats.solved;
  document.getElementById('attempted-count').textContent = stats.attempted;
  document.getElementById('total-count').textContent = stats.total;
  
  const percentage = Math.round((stats.solved / stats.total) * 100);
  document.getElementById('progress-bar').style.width = `${percentage}%`;
  
  return stats;
}
```

---

## 🔍 Filter UI Example

```javascript
// React component example
function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [filters, setFilters] = useState({
    status: null,
    topic: null,
    tag: null
  });
  
  useEffect(() => {
    fetchProblems(filters).then(setProblems);
  }, [filters]);
  
  return (
    <div>
      {/* Status Filter */}
      <select onChange={e => setFilters({...filters, status: e.target.value})}>
        <option value="">All</option>
        <option value="SOLVED">Solved</option>
        <option value="ATTEMPTED">Attempted</option>
        <option value="NOT_STARTED">Not Started</option>
      </select>
      
      {/* Topic Filter */}
      <select onChange={e => setFilters({...filters, topic: e.target.value})}>
        <option value="">All Topics</option>
        <option value="Array">Array</option>
        <option value="String">String</option>
        {/* ... more topics */}
      </select>
      
      {/* Difficulty Filter */}
      <select onChange={e => setFilters({...filters, tag: e.target.value})}>
        <option value="">All Difficulties</option>
        <option value="EASY">Easy</option>
        <option value="MEDIUM">Medium</option>
        <option value="HARD">Hard</option>
      </select>
      
      {/* Problem List */}
      {problems.content?.map(problem => (
        <ProblemCard key={problem.pid} problem={problem} />
      ))}
    </div>
  );
}
```

---

## 💾 localStorage Structure

```javascript
{
  // User ID
  "userId": "1",
  
  // Last sync timestamp
  "lastSync": "2026-02-13T10:30:00Z",
  
  // Progress map for O(1) lookup
  "userProgress": {
    "1": {
      "pid": 1,
      "status": "SOLVED",
      "attemptCount": 3,
      "firstAttemptedAt": "2026-02-10T10:30:00",
      "solvedAt": "2026-02-12T15:45:00"
    },
    "5": {
      "pid": 5,
      "status": "ATTEMPTED",
      "attemptCount": 2,
      "firstAttemptedAt": "2026-02-13T09:00:00",
      "solvedAt": null
    }
    // ... more problems
  }
}
```

---

## ⚡ Performance Tips

1. **Load once on startup** - Fetch all progress in one call
2. **Use localStorage** - O(1) lookup for status checks
3. **Optimistic updates** - Update UI immediately, sync with backend
4. **Backend filtering** - Let backend handle complex filters
5. **Cache invalidation** - Sync on login, clear on logout

---

## 🎯 Complete Workflow

```javascript
// 1. On app load
await loadUserProgress(userId);
await loadUserStats();

// 2. Display country map with colors
colorCountriesBasedOnProgress();

// 3. User clicks country/problem
const status = getProblemStatus(problemId);
showProblemDetails(problemId, status);

// 4. User attempts problem
await attemptProblem(problemId);

// 5. User solves problem
await completeProblem(problemId);

// 6. Filter problem list
const results = await fetchProblems({ 
  status: 'NOT_STARTED', 
  tag: 'EASY' 
});
```

---

## 🚨 Error Handling

```javascript
// Sync validation
function shouldResync() {
  const lastSync = localStorage.getItem('lastSync');
  if (!lastSync) return true;
  
  const hoursSinceSync = (Date.now() - new Date(lastSync)) / (1000 * 60 * 60);
  return hoursSinceSync > 24; // Resync after 24 hours
}

// Auto-resync if stale
if (shouldResync()) {
  await loadUserProgress(userId);
}
```
