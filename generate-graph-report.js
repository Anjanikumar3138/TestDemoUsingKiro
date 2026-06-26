/**
 * Generates a graphical HTML report from Playwright JSON results.
 * Usage: node generate-graph-report.js
 * Output: playwright-report/graphical-report.html
 */
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'playwright-report', 'test-results.json');
if (!fs.existsSync(jsonPath)) {
  console.error('Error: playwright-report/test-results.json not found!');
  console.error('Run "npx playwright test" first.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
let totalTests = 0, passed = 0, failed = 0, skipped = 0;
const testDetails = [];
const suiteResults = [];
const durations = [];

function processSuite(suite, parentTitle) {
  const fullTitle = parentTitle ? `${parentTitle} > ${suite.title}` : suite.title;
  let sp = 0, sf = 0, ss = 0;
  if (suite.specs) {
    for (const spec of suite.specs) {
      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          totalTests++;
          const d = result.duration || 0;
          durations.push(d);
          const st = result.status;
          if (st === 'passed' || test.status === 'expected') { passed++; sp++; }
          else if (st === 'failed' || st === 'unexpected') { failed++; sf++; }
          else if (st === 'skipped') { skipped++; ss++; }
          else { failed++; sf++; }
          testDetails.push({ name: spec.title, suite: fullTitle, status: st === 'passed' || test.status === 'expected' ? 'passed' : st, duration: d });
        }
      }
    }
  }
  if (suite.specs && suite.specs.length > 0) {
    suiteResults.push({ name: suite.title, passed: sp, failed: sf, skipped: ss, total: sp+sf+ss });
  }
  if (suite.suites) { for (const child of suite.suites) processSuite(child, fullTitle); }
}
for (const suite of data.suites || []) processSuite(suite, '');

const passRate = totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) : '0';
const avgDuration = durations.length > 0 ? (durations.reduce((a,b)=>a+b,0)/durations.length).toFixed(0) : 0;
const totalDuration = durations.reduce((a,b)=>a+b,0);

const positiveTests = testDetails.filter(t => t.suite.toLowerCase().includes('positive'));
const negativeTests = testDetails.filter(t => t.suite.toLowerCase().includes('negative'));
const propertyTests = testDetails.filter(t => t.suite.toLowerCase().includes('propert'));

const sorted = [...testDetails].sort((a,b) => b.duration - a.duration).slice(0, 20);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Playwright Test Results - Graphical Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#0f0f23;color:#eee;padding:30px}
    .header{text-align:center;padding:30px;background:linear-gradient(135deg,#1db954 0%,#1ed760 50%,#169c46 100%);border-radius:12px;margin-bottom:30px;color:#fff}
    .header h1{font-size:28px;margin-bottom:8px}
    .header p{font-size:14px;opacity:0.9}
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px;margin-bottom:30px}
    .stat-card{background:#1a1a3e;border-radius:12px;padding:24px;text-align:center;border:1px solid #2a2a5e}
    .stat-card .value{font-size:32px;font-weight:700;margin-bottom:8px}
    .stat-card .label{font-size:12px;color:#aaa;text-transform:uppercase;letter-spacing:1px}
    .stat-card.pass .value{color:#4caf50}
    .stat-card.fail .value{color:#f44336}
    .stat-card.skip .value{color:#ff9800}
    .stat-card.info .value{color:#2196f3}
    .stat-card.rate .value{color:#1db954}
    .chart-container{background:#1a1a3e;border-radius:12px;padding:24px;margin-bottom:30px;border:1px solid #2a2a5e}
    .chart-container h2{font-size:18px;margin-bottom:20px;color:#1db954}
    .chart-row{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:30px}
    @media(max-width:768px){.chart-row{grid-template-columns:1fr}}
    .test-table{width:100%;border-collapse:collapse;margin-top:15px}
    .test-table th,.test-table td{padding:12px 16px;text-align:left;border-bottom:1px solid #2a2a5e}
    .test-table th{background:#12122e;color:#1db954;font-size:12px;text-transform:uppercase;letter-spacing:1px}
    .test-table td{font-size:13px}
    .badge{padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600}
    .badge.pass{background:#1b5e20;color:#4caf50}
    .badge.fail{background:#b71c1c;color:#ef9a9a}
    .badge.skip{background:#e65100;color:#ffcc02}
    .footer{text-align:center;padding:20px;color:#555;font-size:12px}
  </style>
</head>
<body>
  <div class="header">
    <h1>Playwright API Test Results</h1>
    <p>User Registration API | Total Duration: ${(totalDuration/1000).toFixed(1)}s | Generated: ${new Date().toLocaleString()}</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card info"><div class="value">${totalTests}</div><div class="label">Total Tests</div></div>
    <div class="stat-card pass"><div class="value">${passed}</div><div class="label">Passed</div></div>
    <div class="stat-card fail"><div class="value">${failed}</div><div class="label">Failed</div></div>
    <div class="stat-card skip"><div class="value">${skipped}</div><div class="label">Skipped</div></div>
    <div class="stat-card rate"><div class="value">${passRate}%</div><div class="label">Pass Rate</div></div>
    <div class="stat-card info"><div class="value">${avgDuration}ms</div><div class="label">Avg Duration</div></div>
  </div>

  <div class="chart-row">
    <div class="chart-container">
      <h2>Test Results Distribution</h2>
      <canvas id="pieChart"></canvas>
    </div>
    <div class="chart-container">
      <h2>Results by Test Category</h2>
      <canvas id="categoryChart"></canvas>
    </div>
  </div>

  <div class="chart-row">
    <div class="chart-container">
      <h2>Test Duration Distribution</h2>
      <canvas id="durationChart"></canvas>
    </div>
    <div class="chart-container">
      <h2>Suite Pass Rate</h2>
      <canvas id="suiteChart"></canvas>
    </div>
  </div>

  <div class="chart-container">
    <h2>Top 20 Slowest Tests</h2>
    <canvas id="slowestChart"></canvas>
  </div>

  <div class="chart-container">
    <h2>All Test Details</h2>
    <table class="test-table">
      <thead><tr><th>#</th><th>Test Name</th><th>Category</th><th>Status</th><th>Duration</th></tr></thead>
      <tbody>
${testDetails.map((t,i) => `        <tr><td>${i+1}</td><td>${t.name}</td><td>${t.suite.split('>').pop().trim()}</td><td><span class="badge ${t.status==='passed'?'pass':t.status==='skipped'?'skip':'fail'}">${t.status.toUpperCase()}</span></td><td>${t.duration}ms</td></tr>`).join('\n')}
      </tbody>
    </table>
  </div>

  <div class="footer">Generated from Playwright JSON Results | User Registration API Testing Project</div>

  <script>
    Chart.defaults.color='#aaa';
    Chart.defaults.borderColor='#2a2a5e';

    new Chart(document.getElementById('pieChart'),{type:'doughnut',data:{labels:['Passed','Failed','Skipped'],datasets:[{data:[${passed},${failed},${skipped}],backgroundColor:['#4caf50','#f44336','#ff9800'],borderWidth:0}]},options:{responsive:true,cutout:'60%',plugins:{legend:{position:'bottom'}}}});

    new Chart(document.getElementById('categoryChart'),{type:'bar',data:{labels:['Positive','Negative','Property-Based'],datasets:[{label:'Passed',data:[${positiveTests.filter(t=>t.status==='passed').length},${negativeTests.filter(t=>t.status==='passed').length},${propertyTests.filter(t=>t.status==='passed').length}],backgroundColor:'#4caf50',borderRadius:4},{label:'Failed',data:[${positiveTests.filter(t=>t.status!=='passed'&&t.status!=='skipped').length},${negativeTests.filter(t=>t.status!=='passed'&&t.status!=='skipped').length},${propertyTests.filter(t=>t.status!=='passed'&&t.status!=='skipped').length}],backgroundColor:'#f44336',borderRadius:4}]},options:{responsive:true,plugins:{legend:{position:'bottom'}},scales:{y:{beginAtZero:true,grid:{color:'#2a2a5e'}},x:{grid:{display:false}}}}});

    var durations=[${durations.join(',')}];
    var bucketCounts=[durations.filter(d=>d<=100).length,durations.filter(d=>d>100&&d<=500).length,durations.filter(d=>d>500&&d<=1000).length,durations.filter(d=>d>1000&&d<=2000).length,durations.filter(d=>d>2000).length];
    new Chart(document.getElementById('durationChart'),{type:'bar',data:{labels:['0-100ms','100-500ms','500-1s','1-2s','2s+'],datasets:[{label:'Tests',data:bucketCounts,backgroundColor:'#2196f3',borderRadius:4}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'#2a2a5e'}},x:{grid:{display:false}}}}});

    var suiteData=${JSON.stringify(suiteResults.slice(0,10))};
    new Chart(document.getElementById('suiteChart'),{type:'bar',data:{labels:suiteData.map(s=>s.name.length>35?s.name.substring(0,35)+'...':s.name),datasets:[{label:'Passed',data:suiteData.map(s=>s.passed),backgroundColor:'#4caf50',borderRadius:4},{label:'Failed',data:suiteData.map(s=>s.failed),backgroundColor:'#f44336',borderRadius:4}]},options:{indexAxis:'y',responsive:true,plugins:{legend:{position:'bottom'}},scales:{x:{beginAtZero:true,stacked:true,grid:{color:'#2a2a5e'}},y:{stacked:true,grid:{display:false}}}}});

    var slowest=${JSON.stringify(sorted)};
    new Chart(document.getElementById('slowestChart'),{type:'bar',data:{labels:slowest.map(t=>t.name.length>45?t.name.substring(0,45)+'...':t.name),datasets:[{label:'Duration (ms)',data:slowest.map(t=>t.duration),backgroundColor:slowest.map(t=>t.duration>2000?'#f44336':t.duration>1000?'#ff9800':'#1db954'),borderRadius:4}]},options:{indexAxis:'y',responsive:true,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,title:{display:true,text:'Duration (ms)'},grid:{color:'#2a2a5e'}},y:{grid:{display:false}}}}});
  </script>
</body>
</html>`;

const outputPath = path.join(__dirname, 'playwright-report', 'graphical-report.html');
fs.writeFileSync(outputPath, html);
console.log('\\nGraphical report generated: playwright-report/graphical-report.html');
console.log('Open it in your browser to view the charts.\\n');
