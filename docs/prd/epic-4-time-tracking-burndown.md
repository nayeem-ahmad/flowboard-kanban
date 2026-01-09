# Epic 4: Time Tracking & Burndown

**Goal**: Implement time estimation and tracking on cards, aggregate remaining hours per list/board, and display an interactive burndown chart with ideal trend line.

## Story 4.1: Card Time Tracking Fields
**As a** developer,  
**I want** to log initial estimate and remaining hours on cards,  
**so that** my team can track effort.

**Acceptance Criteria:**
1. Card modal shows "Initial Estimate (hrs)" number input
2. Card modal shows "Remaining (hrs)" number input
3. Values accept decimal (0.5 increments)
4. Time badge appears on card if hours > 0
5. Remaining hours can be updated independently
6. Zero remaining indicates complete

## Story 4.2: List Hour Totals
**As a** scrum master,  
**I want** to see total hours per list,  
**so that** I can gauge column workload.

**Acceptance Criteria:**
1. List header shows total initial estimate badge
2. List header shows total remaining hours badge
3. Badges update when cards are added/moved/edited
4. Different styling distinguishes estimate vs remaining
5. Tooltips explain badge meanings

## Story 4.3: Burndown Chart Panel
**As a** scrum master,  
**I want** to see a burndown chart for the sprint,  
**so that** I can track progress against timeline.

**Acceptance Criteria:**
1. Floating burndown panel appears on board view
2. Panel header shows total remaining hours
3. Chart plots remaining hours on Y-axis
4. Chart plots sprint days on X-axis (start to end date)
5. Panel can be collapsed to header-only view
6. Panel can be dragged/repositioned (optional)

## Story 4.4: Burndown Trend Line
**As a** scrum master,  
**I want** to see an ideal trend line on the burndown,  
**so that** I can compare actual vs expected progress.

**Acceptance Criteria:**
1. Chart shows ideal burndown line (start total to zero)
2. Ideal line is dashed/styled differently from actual
3. Chart shows actual progress line from historical data
4. Legend indicates ideal vs actual lines
5. Intersection/divergence is visually clear

## Story 4.5: Burndown History Tracking
**As a** system,  
**I want** to record daily remaining hours,  
**so that** burndown chart shows historical progress.

**Acceptance Criteria:**
1. System records total remaining hours daily
2. History stores date and remaining value pairs
3. History used to plot actual burndown line
4. New day's data added automatically or on first access
5. History persists with board data

---
