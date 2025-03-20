import { WeekData } from './api/weeklyDataService';

/**
 * Service for providing sample data
 * This is for demo and development purposes only
 */
export const sampleDataService = {
  // Sample week data for one sales user
  getSampleWeekData: (): WeekData[] => {
    return [
      {
        weekNumber: 1,
        actions: [
          {
            name: "Action KPI name #1",
            done: 8,
            target: 10,
            progress: 80
          },
          {
            name: "Action KPI name #2",
            done: 5,
            target: 5,
            progress: 100
          },
          {
            name: "Action KPI name #3",
            done: 3,
            target: 15,
            progress: 20
          }
        ],
        skillsets: [
          {
            name: "Skillset KPI name #1",
            wording: 4,
            tonality: 3,
            rapport: 5,
            total: 12
          },
          {
            name: "Skillset KPI name #2",
            wording: 3,
            tonality: 4,
            rapport: 3,
            total: 10
          }
        ],
        requirements: [
          { name: 'Weekly Training', isDone: true },
          { name: 'Report Submission', isDone: true },
          { name: 'Team Meeting', isDone: false }
        ],
        requirementCounts: [
          { name: 'Training Completed', count: 5 },
          { name: 'HOME Academy Video Completed', count: 4 }
        ],
        codeOfHonors: [
          { name: 'Punctuality', hasWarning: false },
          { name: 'Dress Code', hasWarning: true }
        ],
        mentorNotes: [
          {
            id: "1",
            text: "Good progress with cold calling skills.",
            createdAt: new Date(2023, 5, 1),
            createdBy: "Mentor"
          }
        ]
      },
      {
        weekNumber: 2,
        actions: [
          {
            name: "Action KPI name #1",
            done: 10,
            target: 10,
            progress: 100
          },
          {
            name: "Action KPI name #2",
            done: 3,
            target: 5,
            progress: 60
          },
          {
            name: "Action KPI name #3",
            done: 12,
            target: 15,
            progress: 80
          }
        ],
        skillsets: [
          {
            name: "Skillset KPI name #1",
            wording: 5,
            tonality: 4,
            rapport: 4,
            total: 13
          },
          {
            name: "Skillset KPI name #2",
            wording: 4,
            tonality: 5,
            rapport: 4,
            total: 13
          },
          {
            name: "Skillset KPI name #3",
            wording: 3,
            tonality: 3,
            rapport: 2,
            total: 8
          }
        ],
        requirements: [
          { name: 'Weekly Training', isDone: true },
          { name: 'Report Submission', isDone: true },
          { name: 'Team Meeting', isDone: true }
        ],
        requirementCounts: [
          { name: 'Training Completed', count: 7 },
          { name: 'HOME Academy Video Completed', count: 6 }
        ],
        codeOfHonors: [
          { name: 'Punctuality', hasWarning: false },
          { name: 'Dress Code', hasWarning: false }
        ],
        mentorNotes: [
          {
            id: "3",
            text: "Excellent improvement this week.",
            createdAt: new Date(2023, 5, 10),
            createdBy: "Mentor"
          }
        ]
      }
    ];
  },
  
  // Get sample summary metrics
  getSampleSummaryMetrics: () => {
    return {
      weeksPassed: 7,
      target100PercentWeeks: 5,
      targetFailedWeeks: 2,
      cohWarnings: 1
    };
  }
}; 