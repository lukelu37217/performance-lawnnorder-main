import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, XCircle, Calendar, Users, TrendingUp } from 'lucide-react';

const ScoringGuide = () => {
  const categories = [
    {
      name: "Performance",
      icon: TrendingUp,
      color: "text-blue-600",
      indicators: [
        { 
          name: 'Project Completion (%)', 
          criteria: [
            { score: 0, description: '<70% completion', example: 'Left multiple tasks unfinished' },
            { score: 1, description: '≥70% completion', example: 'Completed most basic requirements' },
            { score: 2, description: '≥80% completion', example: 'Met all main objectives with minor gaps' },
            { score: 3, description: '100% completion', example: 'All tasks completed to specification' }
          ]
        },
        { 
          name: 'Quality Issues', 
          criteria: [
            { score: 0, description: '2+ major issues', example: 'Work requires significant rework' },
            { score: 1, description: '2 minor issues', example: 'Small adjustments needed' },
            { score: 2, description: '1 minor issue', example: 'One small correction required' },
            { score: 3, description: 'No issues', example: 'Work meets all quality standards' }
          ]
        },
        { 
          name: 'Tool Care & Clean-up', 
          criteria: [
            { score: 0, description: 'Deliberately ignored', example: 'Left tools dirty, ignored cleanup duties' },
            { score: 1, description: 'Neglected', example: 'Minimal cleanup, tools not maintained' },
            { score: 2, description: 'Partially cleaned', example: 'Some cleanup done, room for improvement' },
            { score: 3, description: 'Fully cleaned', example: 'All tools clean, area organized' }
          ]
        },
        { 
          name: 'Equipment & Vehicle Etiquette', 
          criteria: [
            { score: 0, description: 'Unsafe behavior', example: 'Misused equipment, safety violations' },
            { score: 1, description: 'Careless use', example: 'Occasional mishandling of equipment' },
            { score: 2, description: 'Minor misuse', example: 'Generally good with small mistakes' },
            { score: 3, description: 'Always responsible', example: 'Proper equipment use, follows protocols' }
          ]
        }
      ]
    },
    {
      name: "Safety",
      icon: AlertCircle,
      color: "text-red-600",
      indicators: [
        { 
          name: 'Near Miss Reported', 
          criteria: [
            { score: 0, description: 'No', example: 'Did not report near miss incidents (missed opportunity)' },
            { score: 3, description: 'Yes', example: 'Proactively reported near miss, promotes safety culture' }
          ]
        },
        { 
          name: 'Incident Occurred', 
          criteria: [
            { score: 0, description: 'Yes', example: 'Was involved in a safety incident (safety failure)' },
            { score: 3, description: 'No', example: 'No safety incidents during period (positive outcome)' }
          ]
        }
      ]
    },
    {
      name: "Behavior & Attitude",
      icon: Users,
      color: "text-green-600",
      indicators: [
        { 
          name: 'Attendance', 
          criteria: [
            { score: 0, description: '2+ unexcused absences', example: 'Multiple no-shows without notice' },
            { score: 1, description: '2 lates/absences', example: 'Occasional tardiness or absences' },
            { score: 2, description: '1 late', example: 'One minor attendance issue' },
            { score: 3, description: 'Perfect', example: 'On time every day, no absences' }
          ]
        },
        { 
          name: 'Attitude / Professionalism', 
          criteria: [
            { score: 0, description: 'Very Poor', example: 'Negative attitude, unprofessional behavior' },
            { score: 1, description: 'Poor', example: 'Occasional attitude problems' },
            { score: 2, description: 'Average', example: 'Generally positive, minor issues' },
            { score: 3, description: 'Excellent', example: 'Consistently positive and professional' }
          ]
        },
        { 
          name: 'Task Ownership', 
          criteria: [
            { score: 0, description: 'Uncooperative', example: 'Refuses tasks, argues with instructions' },
            { score: 1, description: 'Passive', example: 'Does minimum required, lacks initiative' },
            { score: 2, description: 'Needs reminders', example: 'Good worker but requires direction' },
            { score: 3, description: 'Proactive', example: 'Takes initiative, anticipates needs' }
          ]
        }
      ]
    },
    {
      name: "Teamwork & Customer Interaction",
      icon: Users,
      color: "text-purple-600",
      indicators: [
        { 
          name: 'Customer Interaction', 
          criteria: [
            { score: 0, description: 'Complaint/negative', example: 'Customer complained about behavior' },
            { score: 1, description: 'Cold/indifferent', example: 'Minimal interaction, unfriendly' },
            { score: 2, description: 'Neutral', example: 'Polite but not engaging' },
            { score: 3, description: 'Positive', example: 'Friendly, helpful, professional' }
          ]
        },
        { 
          name: 'Teamwork on Job Site', 
          criteria: [
            { score: 0, description: 'Ignores team', example: 'Works alone, disrupts team flow' },
            { score: 1, description: 'Occasionally disrupts', example: 'Sometimes causes team friction' },
            { score: 2, description: 'Minor issues', example: 'Generally good team player' },
            { score: 3, description: 'Seamless', example: 'Excellent collaboration, helps others' }
          ]
        }
      ]
    }
  ];

  const ratingScale = [
    { 
      rating: 'A', 
      range: '27-33', 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircle,
      description: 'Exceptional Performance',
      meaning: 'Consistently exceeds expectations across all categories. Sets positive example for team.'
    },
    { 
      rating: 'B', 
      range: '21-26', 
      color: 'bg-blue-100 text-blue-800', 
      icon: TrendingUp,
      description: 'Good Performance',
      meaning: 'Meets expectations with some areas of strength. Reliable team member.'
    },
    { 
      rating: 'C', 
      range: '0-20', 
      color: 'bg-red-100 text-red-800', 
      icon: XCircle,
      description: 'Needs Improvement',
      meaning: 'Below expectations in multiple areas. Requires coaching and development.'
    }
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Biweekly Performance Evaluation Guide</h1>
        <p className="text-lg text-gray-600">Complete scoring criteria and evaluation instructions</p>
      </div>

      {/* Rating Scale Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Rating Scale Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ratingScale.map((scale) => {
              const IconComponent = scale.icon;
              return (
                <div key={scale.rating} className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <IconComponent className="w-8 h-8 text-gray-600" />
                  </div>
                  <Badge className={`${scale.color} text-lg px-3 py-1 mb-2`}>
                    {scale.rating} Rating
                  </Badge>
                  <div className="font-semibold text-sm text-gray-600 mb-1">
                    {scale.range} points
                  </div>
                  <div className="font-medium text-gray-900 mb-2">
                    {scale.description}
                  </div>
                  <div className="text-sm text-gray-600">
                    {scale.meaning}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Evaluation Process & Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Evaluation Cycle</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Evaluations are conducted every <strong>2 weeks</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Foremen evaluate their assigned Workers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Managers evaluate both Workers and Foremen
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Reminders sent 2-3 days before deadline
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">Step-by-Step Process</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">1</span>
                  Select employee to evaluate from dropdown
                </li>
                <li className="flex gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">2</span>
                  Score each indicator (0-3) based on criteria
                </li>
                <li className="flex gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">3</span>
                  Add optional notes for context
                </li>
                <li className="flex gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">4</span>
                  Review total score and rating
                </li>
                <li className="flex gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">5</span>
                  Submit evaluation
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scoring Criteria */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Detailed Scoring Criteria</h2>
        
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card key={category.name}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${category.color}`}>
                  <IconComponent className="w-5 h-5" />
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {category.indicators.map((indicator, idx) => (
                    <div key={idx}>
                      <h4 className="font-semibold text-lg mb-3">{indicator.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {indicator.criteria.map((criterion, criterionIdx) => (
                          <div key={criterionIdx} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={criterion.score === 3 ? 'default' : criterion.score === 0 ? 'destructive' : 'secondary'}>
                                {criterion.score} Points
                              </Badge>
                            </div>
                            <div className="font-medium text-sm mb-1">
                              {criterion.description}
                            </div>
                            <div className="text-xs text-gray-600">
                              Example: {criterion.example}
                            </div>
                          </div>
                        ))}
                      </div>
                      {idx < category.indicators.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices for Evaluators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-green-700">✅ Do</h3>
              <ul className="space-y-2 text-sm">
                <li>• Be objective and focus on observable behaviors</li>
                <li>• Use specific examples in your notes</li>
                <li>• Evaluate the full 2-week period, not just recent events</li>
                <li>• Provide constructive feedback for improvement</li>
                <li>• Be consistent in your scoring criteria</li>
                <li>• Encourage near miss reporting (it's positive behavior)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-red-700">❌ Don't</h3>
              <ul className="space-y-2 text-sm">
                <li>• Let personal feelings influence scores</li>
                <li>• Focus only on one good or bad day</li>
                <li>• Compare employees to each other</li>
                <li>• Leave evaluations until the last minute</li>
                <li>• Skip the notes section for low scores</li>
                <li>• Penalize near miss reporting (it prevents incidents)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoringGuide;
