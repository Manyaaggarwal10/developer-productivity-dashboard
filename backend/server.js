const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// -------------------- DATABASE --------------------
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Man@123#",
  database: "developer_productivity"
});

db.connect((err) => {
  if (err) {
    console.log("Database Error:", err);
  } else {
    console.log("MySQL Connected");
  }
});

// -------------------- HOME ROUTE --------------------
app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

// -------------------- INSIGHTS FUNCTION --------------------
function generateInsights(data, developerId, month) {
  const pr = Number(data.pr_throughput || 0);
  const dep = Number(data.deployment_frequency || 0);
  const lead = Number(data.avg_lead_time || 0);
  const cycle = Number(data.avg_cycle_time || 0);
  const bug = Number(data.bug_rate || 0);

  let strengths = [];
  let risks = [];
  let actions = [];
  let summary = "";

  const totalActivity = pr + dep;

  // No data found
  if (totalActivity === 0 && lead === 0 && cycle === 0 && bug === 0) {
    return {
      summary: `No productivity data found for ${developerId} in ${month}.`,
      strengths: [],
      risks: ["No matching records available."],
      actions: ["Check Developer ID or select another month."]
    };
  }

  // PR Throughput
  if (pr >= 4) strengths.push("Strong contribution volume.");
  else if (pr >= 2) strengths.push("Stable pull request throughput.");
  else risks.push("Low contribution volume.");

  // Deployment Frequency
  if (dep >= 3) strengths.push("Healthy deployment cadence.");
  else if (dep >= 1) strengths.push("Consistent release participation.");
  else risks.push("No successful deployments this month.");

  // Lead Time
  if (lead > 0 && lead <= 3) strengths.push("Excellent delivery speed.");
  else if (lead > 3 && lead <= 5) strengths.push("Healthy change lead time.");
  else if (lead > 5) {
    risks.push("Slow release turnaround.");
    actions.push("Reduce review and deployment delays.");
  }

  // Cycle Time
  if (cycle > 0 && cycle <= 4) strengths.push("Tasks completed efficiently.");
  else if (cycle > 4 && cycle <= 6) risks.push("Moderate task completion delay.");
  else if (cycle > 6) {
    risks.push("High cycle time.");
    actions.push("Break large tasks into smaller deliverables.");
  }

  // Bug Rate
  if (bug < 20) strengths.push("Strong release quality.");
  else if (bug <= 50) {
    risks.push("Moderate quality concerns.");
    actions.push("Increase testing coverage.");
  } else {
    risks.push("High production quality risk.");
    actions.push("Add regression testing and stricter review gates.");
  }

  if (actions.length === 0) {
    actions.push("Maintain current engineering practices.");
  }

  summary =
    `${developerId} showed ${pr >= 2 ? "steady contribution" : "limited contribution"} in ${month}. ` +
    `${dep >= 1 ? "Delivery activity remained active. " : "Release activity was low. "}` +
    `${bug < 20 ? "Code quality remained strong." : "Quality improvements are recommended."}`;

  return {
    summary,
    strengths,
    risks,
    actions
  };
}

// -------------------- DASHBOARD ROUTE --------------------
app.get("/dashboard/:developerId/:month", (req, res) => {
  const developerId = req.params.developerId;
  const month = req.params.month;
  const monthDate = month + "-01";

  // Step 1: Check developer exists
  const checkUser = `
    SELECT developer_id, developer_name
    FROM developers
    WHERE developer_id = ?
  `;

  db.query(checkUser, [developerId], (err, userResult) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (userResult.length === 0) {
      return res.status(404).json({
        found: false,
        message: "Developer ID not found"
      });
    }

    // Step 2: Metrics Query
    const query = `
      SELECT

      (
        SELECT COUNT(*)
        FROM pull_requests
        WHERE developer_id = ?
        AND month_merged = ?
        AND status = 'merged'
      ) AS pr_throughput,

      (
        SELECT COUNT(*)
        FROM deployments
        WHERE developer_id = ?
        AND month_deployed = ?
        AND status = 'success'
      ) AS deployment_frequency,

      (
        SELECT ROUND(AVG(lead_time_days),2)
        FROM deployments
        WHERE developer_id = ?
        AND month_deployed = ?
        AND status = 'success'
      ) AS avg_lead_time,

      (
        SELECT ROUND(AVG(cycle_time_days),2)
        FROM jira_issues
        WHERE developer_id = ?
        AND month_done = ?
        AND status = 'Done'
      ) AS avg_cycle_time,

      (
        SELECT ROUND(
          (
            SELECT COUNT(*)
            FROM bug_reports
            WHERE developer_id = ?
            AND month_found = ?
            AND escaped_to_prod = 'Yes'
          )
          /
          NULLIF(
            (
              SELECT COUNT(*)
              FROM jira_issues
              WHERE developer_id = ?
              AND month_done = ?
              AND status = 'Done'
            ),
            0
          ) * 100,2
        )
      ) AS bug_rate
    `;

    const values = [
      developerId, month,
      developerId, month,
      developerId, month,
      developerId, monthDate,
      developerId, month,
      developerId, monthDate
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      const metrics = result[0];
      const insights = generateInsights(metrics, developerId, month);

      let overallStatus = "Needs Attention";

const goodCount =
  (metrics.pr_throughput >= 4 ? 1 : 0) +
  (metrics.deployment_frequency >= 3 ? 1 : 0) +
  (metrics.avg_lead_time <= 3 ? 1 : 0) +
  (metrics.avg_cycle_time <= 4 ? 1 : 0) +
  (metrics.bug_rate < 20 ? 1 : 0);

if (goodCount >= 4) overallStatus = "Excellent";
else if (goodCount >= 3) overallStatus = "Healthy";
else if (goodCount >= 2) overallStatus = "Moderate";

res.json({
  developerId: developerId,
  overallStatus: overallStatus,

  metrics: {
    prThroughput: metrics.pr_throughput,
    deployments: metrics.deployment_frequency,
    avgLeadTime: metrics.avg_lead_time,
    avgCycleTime: metrics.avg_cycle_time,
    bugRate: metrics.bug_rate
  },

  executiveSummary: insights.summary,

  strengthAreas: insights.strengths,
  riskAreas: insights.risks,
  recommendedActions: insights.actions
});
    });
  });
});

// -------------------- START SERVER --------------------
app.listen(5000, () => {
  console.log("Server running on port 5000");
});