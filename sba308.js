const courseInfo = {
    id: 451,
    name: "Introduction to JavaScript"
};

const assignmentGroups = [
    {
        id: 12345,
        name: "Fundamentals of JavaScript",
        course_id: 451,
        group_weight: 25,
        assignments: [
            {
                id: 1,
                name: "Declare a Variable",
                due_at: "2023-01-25",
                points_possible: 50
            },
            {
                id: 2,
                name: "Write a Function",
                due_at: "2023-02-27",
                points_possible: 150
            },
            {
                id: 3,
                name: "Code the World",
                due_at: "3156-11-15",
                points_possible: 500
            }
        ]
    }
];

const learnerSubmissions = [
    {
        learner_id: 125,
        assignment_id: 1,
        submission: {
            submitted_at: "2023-01-25",
            score: 47
        }
    },
    {
        learner_id: 125,
        assignment_id: 2,
        submission: {
            submitted_at: "2023-02-12",
            score: 150
        }
    },
    {
        learner_id: 125,
        assignment_id: 3,
        submission: {
            submitted_at: "2023-01-25",
            score: 400
        }
    },
    {
        learner_id: 132,
        assignment_id: 1,
        submission: {
            submitted_at: "2023-01-24",
            score: 39
        }
    },
    {
        learner_id: 132,
        assignment_id: 2,
        submission: {
            submitted_at: "2023-03-07",
            score: 140
        }
    }
];

function getLearnerData(courseInfo, assignmentGroups, learnerSubmissions) {
    const results = [];
    const currentDate = new Date();

    try {
        // Validate that each AssignmentGroup has the correct course_id
        for (const group of assignmentGroups) {
            if (group.course_id !== courseInfo.id) {
                throw new Error(`AssignmentGroup with ID ${group.id} does not match course ID ${courseInfo.id}`);
            }
        }

        // Group submissions by learner using reduce
        const submissionsByLearner = learnerSubmissions.reduce((acc, sub) => {
            if (!acc[sub.learner_id]) acc[sub.learner_id] = [];
            acc[sub.learner_id].push(sub);
            return acc;
        }, {});

        // Helper function for score calculation with lateness penalty
        function calculateScore(score, dueDate, submittedAt, pointsPossible) {
            const isLate = new Date(submittedAt) > new Date(dueDate);
            let adjustedScore = score;

            if (isLate) {
                adjustedScore -= 0.1 * pointsPossible;
                adjustedScore = Math.max(adjustedScore, 0); // Avoid negative scores
            }

            return adjustedScore / pointsPossible;
        }

        // Process each learner's submissions
        for (const learnerId in submissionsByLearner) {
            const learnerData = { id: Number(learnerId), assignments: {}, totalWeightedScore: 0, totalWeight: 0 };
            const submissions = submissionsByLearner[learnerId];

            for (let i = 0; i < submissions.length; i++) {
                const { assignment_id, submission } = submissions[i];
                const { submitted_at, score } = submission;

                const assignmentGroup = assignmentGroups.find(group => group.assignments.some(a => a.id === assignment_id));
                if (!assignmentGroup) continue;

                const assignment = assignmentGroup.assignments.find(a => a.id === assignment_id);
                if (!assignment || new Date(assignment.due_at) > currentDate) continue;

                const { due_at: dueDate, points_possible: pointsPossible } = assignment;
                if (pointsPossible <= 0) {
                    console.warn(`Skipping assignment ${assignment_id} due to invalid points_possible`);
                    continue;
                }

                // Calculate score percentage with lateness check
                const scorePercentage = calculateScore(score, dueDate, submitted_at, pointsPossible) * 100;
                learnerData.assignments[assignment_id] = scorePercentage;

                // Accumulate weighted score
                learnerData.totalWeightedScore += scorePercentage * assignmentGroup.group_weight * pointsPossible / 100;
                learnerData.totalWeight += assignmentGroup.group_weight * pointsPossible;
            }

            // Calculate the weighted average
            learnerData.avg = learnerData.totalWeight > 0 ? (learnerData.totalWeightedScore / learnerData.totalWeight) * 100 : 0;
            results.push(learnerData);
        }

        // Output each learner's results
        for (let result of results) {
            console.log(`Learner ID: ${result.id}, Average Score: ${result.avg}%`);
            for (let assignmentId in result.assignments) {
                console.log(`Assignment ID ${assignmentId}: ${result.assignments[assignmentId]}%`);
            }
        }

        return results;

    } catch (error) {
        console.error("Error processing learner data:", error.message);
        return null;
    }
}

// Test the function
console.log(getLearnerData(courseInfo, assignmentGroups, learnerSubmissions));