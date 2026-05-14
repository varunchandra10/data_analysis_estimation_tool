import React, { useState } from "react";
import axios from "axios";

const RuleValidationPanel = ({ data }) => {

  if (!data) return null;

  const { metadata, schema } = data;

  const [rules, setRules] = useState([]);

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // ADD SIMPLE RULE
  // =====================================================

  const addSimpleRule = () => {

    setRules(prev => ([

      ...prev,

      {
        type: "simple",
        column: "",
        operator: ">=",
        value: "",
        severity: "medium"
      }

    ]));
  };

  // =====================================================
  // UPDATE RULE
  // =====================================================

  const updateRule = (
    index,
    field,
    value
  ) => {

    const updated = [...rules];

    updated[index][field] = value;

    setRules(updated);
  };

  // =====================================================
  // RUN VALIDATION
  // =====================================================

  const runValidation = async () => {

    setLoading(true);

    try {

      const response = await axios.post(
        "http://localhost:8000/api/validation/run",
        {
          file_path: metadata.file_path,
          rules
        }
      );

      setResult(response.data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="bg-white dark:bg-gray-800 rounded-2xl border p-6 mt-8">

      <h2 className="text-2xl font-bold mb-6">
        Rule Validation Engine
      </h2>

      {/* ADD RULE BUTTON */}
      <button
        onClick={addSimpleRule}
        className="bg-purple-600 text-white px-4 py-2 rounded-xl mb-6"
      >
        Add Rule
      </button>

      {/* RULES */}
      <div className="space-y-4">

        {rules.map((rule, idx) => (

          <div
            key={idx}
            className="grid md:grid-cols-4 gap-4 border rounded-xl p-4"
          >

            {/* COLUMN */}
            <select
              value={rule.column}
              onChange={(e) =>
                updateRule(
                  idx,
                  "column",
                  e.target.value
                )
              }
              className="border rounded-lg px-3 py-2"
            >

              <option value="">
                Select Column
              </option>

              {schema.map((col, i) => (

                <option
                  key={i}
                  value={col.column}
                >
                  {col.column}
                </option>

              ))}

            </select>

            {/* OPERATOR */}
            <select
              value={rule.operator}
              onChange={(e) =>
                updateRule(
                  idx,
                  "operator",
                  e.target.value
                )
              }
              className="border rounded-lg px-3 py-2"
            >

              <option value=">">
                {">"}
              </option>

              <option value="<">
                {"<"}
              </option>

              <option value=">=">
                {">="}
              </option>

              <option value="<=">
                {"<="}
              </option>

              <option value="==">
                {"=="}
              </option>

              <option value="!=">
                {"!="}
              </option>

            </select>

            {/* VALUE */}
            <input
              type="text"
              placeholder="Value"
              value={rule.value}
              onChange={(e) =>
                updateRule(
                  idx,
                  "value",
                  e.target.value
                )
              }
              className="border rounded-lg px-3 py-2"
            />

            {/* SEVERITY */}
            <select
              value={rule.severity}
              onChange={(e) =>
                updateRule(
                  idx,
                  "severity",
                  e.target.value
                )
              }
              className="border rounded-lg px-3 py-2"
            >

              <option value="low">
                Low
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="high">
                High
              </option>

            </select>

          </div>

        ))}

      </div>

      {/* RUN BUTTON */}
      <button
        onClick={runValidation}
        disabled={loading}
        className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl"
      >
        {loading ? "Validating..." : "Run Validation"}
      </button>

      {/* RESULTS */}
      {result && (

        <div className="mt-8 space-y-6">

          {/* SUMMARY */}
          <div className="grid md:grid-cols-4 gap-4">

            <div className="border rounded-xl p-4">

              <p className="text-sm text-gray-500">
                Rules
              </p>

              <h3 className="text-2xl font-bold">
                {result.total_rules}
              </h3>

            </div>

            <div className="border rounded-xl p-4">

              <p className="text-sm text-gray-500">
                Violations
              </p>

              <h3 className="text-2xl font-bold text-red-600">
                {result.total_violations}
              </h3>

            </div>

            <div className="border rounded-xl p-4">

              <p className="text-sm text-gray-500">
                High Severity
              </p>

              <h3 className="text-2xl font-bold text-red-600">
                {result.severity_counts.high}
              </h3>

            </div>

            <div className="border rounded-xl p-4">

              <p className="text-sm text-gray-500">
                Medium Severity
              </p>

              <h3 className="text-2xl font-bold text-amber-600">
                {result.severity_counts.medium}
              </h3>

            </div>

          </div>

          {/* VIOLATIONS TABLE */}
          <div className="border rounded-xl p-4 overflow-x-auto">

            <h3 className="font-bold mb-4">
              Violated Rows
            </h3>

            <table className="w-full text-sm">

              <thead>
                <tr>

                  <th className="text-left p-2 border-b">
                    Row
                  </th>

                  <th className="text-left p-2 border-b">
                    Column
                  </th>

                  <th className="text-left p-2 border-b">
                    Actual
                  </th>

                  <th className="text-left p-2 border-b">
                    Expected
                  </th>

                  <th className="text-left p-2 border-b">
                    Severity
                  </th>

                </tr>
              </thead>

              <tbody>

                {result.violations.map((v, idx) => (

                  <tr key={idx}>

                    <td className="p-2 border-b">
                      {v.row_index}
                    </td>

                    <td className="p-2 border-b">
                      {v.column || v.target_column}
                    </td>

                    <td className="p-2 border-b">
                      {String(v.actual_value)}
                    </td>

                    <td className="p-2 border-b">
                      {v.expected}
                    </td>

                    <td className="p-2 border-b">
                      {v.severity}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
};

export default RuleValidationPanel;