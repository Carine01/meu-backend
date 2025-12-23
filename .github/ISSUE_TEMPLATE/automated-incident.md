<!-- 
This template is used by automation workflows for incident reporting.
Do not modify without updating corresponding workflow files.
-->

---
name: Automated Incident Report
about: Auto-generated incident report from monitoring workflows
title: '🚨 [SERVICE] Incident: [BRIEF_DESCRIPTION]'
labels: 'incident, priority/high, automated'
assignees: ''

---

## 🚨 Incident Summary

**Service:** [Service Name]
**Status:** [Unhealthy/Failed/Down]
**Detected:** [Timestamp]
**Workflow Run:** [Link to Actions run]

## 📋 Details

[Detailed description of what failed]

## 🔍 Investigation Checklist

- [ ] Reviewed workflow logs
- [ ] Checked service status
- [ ] Verified configuration/secrets
- [ ] Tested locally if applicable
- [ ] Identified root cause
- [ ] Applied fix
- [ ] Verified fix in production
- [ ] Documented lessons learned

## 🛠️ Actions Taken

1. [Action 1]
2. [Action 2]
3. [Action 3]

## 📊 Impact Assessment

**Severity:** [Critical/High/Medium/Low]
**Users Affected:** [Estimate]
**Duration:** [Time service was down]
**Data Loss:** [Yes/No - describe if yes]

## 🔄 Resolution

**Fix Applied:** [Description]
**Verified At:** [Timestamp]
**Follow-up Required:** [Yes/No]

## 📝 Post-Incident Notes

[Additional notes, lessons learned, or preventive measures]

---

*This incident was detected and reported automatically by monitoring workflows.*
*For security incidents, follow the security incident response plan.*
