/**
 * Template-based fallback roadmap generator.
 *
 * No external API calls. No keys. No billing.
 * Always returns a valid, structured roadmap.
 *
 * Output shape (canonical AI contract):
 * {
 *   roadmapTitle:      string,
 *   estimatedDuration: string,   e.g. "42 days"
 *   overview:          string,
 *   milestones:        Milestone[],
 *   steps:             Step[],           (derived from milestones for DB storage)
 *   totalEstimatedDays: number,
 * }
 *
 * Steps === milestones in different field names so both the API response
 * AND the existing Roadmap model (which uses `steps`) work without changes.
 */

const { findTemplate } = require('./templates');

function normalizeList(values = []) {
  return Array.from(
    new Set(values.map((v) => String(v).trim()).filter((v) => v.length > 0))
  );
}

function formatDuration(days) {
  if (days < 7)  return `${days} day${days !== 1 ? 's' : ''}`;
  if (days < 30) return `${Math.ceil(days / 7)} week${Math.ceil(days / 7) !== 1 ? 's' : ''}`;
  const months = Math.ceil(days / 30);
  return `${months} month${months !== 1 ? 's' : ''}`;
}

/**
 * Build a skill-learning milestone for a missing skill.
 */
function buildSkillMilestone(skillName, order) {
  const lower = skillName.toLowerCase();

  // Skill-specific resource hints
  const resourceMap = {
    react:      ['React official docs', 'Scrimba React course', 'React patterns guide'],
    node:       ['Node.js official docs', 'NodeBestPractices GitHub', 'Express.js guide'],
    python:     ['python.org tutorial', 'Automate the Boring Stuff (free)', 'Real Python tutorials'],
    sql:        ['SQLZoo (free)', 'Mode SQL tutorial', 'PostgreSQL docs'],
    mongodb:    ['MongoDB University (free)', 'Mongoose docs', 'MongoDB data modelling guide'],
    docker:     ['Docker official docs', 'Play with Docker (free)', 'Docker Deep Dive book'],
    git:        ['Pro Git book (free)', 'GitHub Learning Lab', 'Git branching tutorial'],
    typescript: ['TypeScript handbook (free)', 'Total TypeScript', 'TypeScript deep dive (free)'],
    css:        ['MDN CSS docs', 'CSS Tricks', 'Kevin Powell on YouTube'],
    java:       ['Oracle Java tutorials', 'Baeldung Java guides', 'Spring Boot getting started'],
    aws:        ['AWS Free Tier', 'AWS Skill Builder (free)', 'Cloud Practitioner Essentials'],
  };

  // Find matching resources or use generic ones
  const matchKey = Object.keys(resourceMap).find((k) => lower.includes(k));
  const resources = matchKey
    ? resourceMap[matchKey]
    : [
        `${skillName} official documentation`,
        `${skillName} beginner tutorial on YouTube`,
        `${skillName} practice exercises`,
      ];

  return {
    order,
    title: `Learn ${skillName}`,
    description: `Build practical proficiency in ${skillName} through structured study and hands-on exercises. Complete at least one small project to cement the skill.`,
    estimatedDays: 5,
    resources,
  };
}

/**
 * Main generator — template-based with rule-based fallback.
 *
 * @param {object} input
 * @param {string}   input.goalTitle
 * @param {string}   input.targetRole
 * @param {string[]} input.matchedSkills
 * @param {string[]} input.missingSkills
 */
function buildFallbackRoadmap({ goalTitle, targetRole, matchedSkills, missingSkills }) {
  const missing  = normalizeList(missingSkills);
  const matched  = normalizeList(matchedSkills);
  const template = findTemplate(targetRole);

  let steps = [];
  let intro = '';

  if (template) {
    // ── Template path ──────────────────────────────────────────────────────
    intro = template.intro;

    // Start with orientation step
    steps.push({
      order:         1,
      title:         `Define your ${targetRole} roadmap`,
      description:   `Review the requirements and expectations for the ${targetRole} role. Align your existing skills with what the market demands and identify your biggest gaps.`,
      estimatedDays: 2,
      resources:     ['LinkedIn job descriptions', 'Glassdoor role reviews', 'Role requirements research'],
    });

    // Add missing skills as dedicated steps (inject before template phases)
    let order = 2;
    missing.forEach((skill) => {
      // Only add if not covered by a template phase
      const alreadyCovered = template.phases.some(
        (p) => p.title.toLowerCase().includes(skill.toLowerCase())
      );
      if (!alreadyCovered) {
        steps.push(buildSkillMilestone(skill, order));
        order += 1;
      }
    });

    // Add template phases
    template.phases.forEach((phase) => {
      steps.push({
        order,
        title:         phase.title,
        description:   phase.description,
        estimatedDays: phase.durationDays,
        resources:     phase.resources,
      });
      order += 1;
    });

  } else {
    // ── Generic rule-based path ────────────────────────────────────────────
    intro = `A personalised step-by-step learning plan for becoming a ${targetRole}. Built from your skill gaps and existing strengths.`;

    steps.push({
      order:         1,
      title:         'Review your destination',
      description:   `Clarify the requirements for becoming a ${targetRole} and align your plan with the goal "${goalTitle}". Research job descriptions and identify key competencies.`,
      estimatedDays: 2,
      resources:     ['LinkedIn job search', 'Glassdoor role reviews', 'Role requirements research'],
    });

    let order = 2;
    missing.forEach((skill) => {
      steps.push(buildSkillMilestone(skill, order));
      order += 1;
    });

    const matchedStr = matched.join(', ') || 'your existing skills';
    steps.push({
      order,
      title:         'Build a role-focused project',
      description:   `Apply ${matchedStr} alongside your newly learned skills to build a complete project that demonstrates your readiness for the ${targetRole} role.`,
      estimatedDays: 7,
      resources:     ['GitHub project ideas', 'Portfolio checklist', 'README template'],
    });
    order += 1;

    steps.push({
      order,
      title:         'Interview & portfolio preparation',
      description:   `Polish your resume, GitHub profile, and portfolio. Practice common technical and behavioural interview questions for the ${targetRole} role.`,
      estimatedDays: 4,
      resources:     ['Resume review guide', 'Interviewing.io (free mock interviews)', 'Blind 75 LeetCode list'],
    });
  }

  // Always end with a review/interview step if template was used
  if (template) {
    const matchedStr = matched.join(', ') || 'your existing skills';
    steps.push({
      order:         steps.length + 1,
      title:         'Portfolio & interview preparation',
      description:   `Build a portfolio project showcasing ${matchedStr} and your newly acquired skills. Prepare for technical interviews and code reviews.`,
      estimatedDays: 5,
      resources:     ['Resume review guide', 'Interviewing.io', 'GitHub portfolio tips'],
    });
  }

  // Re-number orders to be sequential and clean
  steps = steps.map((s, i) => ({ ...s, order: i + 1 }));

  const totalEstimatedDays = steps.reduce((sum, s) => sum + s.estimatedDays, 0);
  const roadmapTitle = `${targetRole} Learning Roadmap`;

  // Build milestones (same data, client-facing field name)
  const milestones = steps.map((s) => ({
    order:         s.order,
    title:         s.title,
    description:   s.description,
    durationDays:  s.estimatedDays,
    resources:     s.resources,
  }));

  return {
    // Client-facing contract fields
    roadmapTitle,
    estimatedDuration: formatDuration(totalEstimatedDays),
    milestones,

    // DB storage fields (Roadmap model uses these)
    overview:           intro,
    steps,
    totalEstimatedDays,
  };
}

module.exports = { buildFallbackRoadmap };
