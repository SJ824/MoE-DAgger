/* Values and abstract transcribed from the supplied manuscript. */
window.PROJECT_DATA = {
  "abstract": "Selective data acquisition in Dataset Aggregation (DAgger) on robots requires deciding which learner rollouts to correct and when to intervene. In manipulation with ordered phases, router entropy from a phase-supervised soft mixture-of-experts (MoE) is insufficient: the same value can reflect either a normal adjacent-phase handoff or support for nonadjacent or earlier phases. We propose MoE-DAgger, which uses causal router history to distinguish these cases without providing the policy with a phase label, progress variable, or hard phase command during execution. The acquisition rule allows an adjacent transition to settle, but requests correction when high entropy persists outside such a transition, the transition times out, or routing persistently favors an earlier phase. Under matched active human-control budgets, MoE-DAgger achieves 84.0% task success on Green and 78.0% on Red, exceeding phase-unaware filtered entropy by 22 percentage points on Green and 26 points on Red, with no observed collisions in 50 rollouts per task. On 50 shared intervention-free traces per task, 83.3% and 80.0% of its first proposals fall on failed rollouts within predefined failure windows when 15 and 25 traces are selected, compared with 70.0% and 72.0% for temporal action-chunk disagreement and 63.3% and 60.0% for ensemble disagreement. Shadow replay and an active no-veto ablation indicate that suppressing queries at normal adjacent handoffs is a key contributor to the improved allocation.",
  "results": [
    {
      "method": "BC-only",
      "human_seconds": [
        0,
        0
      ],
      "sequence_percent": [
        88,
        82
      ],
      "success_percent": [
        52,
        48
      ],
      "success_CI": [
        [
          38.5,
          65.2
        ],
        [
          34.8,
          61.5
        ]
      ],
      "margin_cm": [
        1.22,
        1.29
      ],
      "collision_percent": [
        12,
        18
      ]
    },
    {
      "method": "ExtraDemo-BC",
      "human_seconds": [
        114.85,
        128.5
      ],
      "sequence_percent": [
        90,
        82
      ],
      "success_percent": [
        58,
        46
      ],
      "success_CI": [
        [
          44.2,
          70.6
        ],
        [
          33.0,
          59.6
        ]
      ],
      "margin_cm": [
        0.97,
        1.27
      ],
      "collision_percent": [
        10,
        18
      ]
    },
    {
      "method": "Human-trigger DAgger",
      "human_seconds": [
        114.45,
        127.95
      ],
      "sequence_percent": [
        98,
        92
      ],
      "success_percent": [
        72,
        68
      ],
      "success_CI": [
        [
          58.3,
          82.5
        ],
        [
          54.2,
          79.2
        ]
      ],
      "margin_cm": [
        -0.18,
        0.21
      ],
      "collision_percent": [
        0,
        4
      ]
    },
    {
      "method": "Phase-matched Random",
      "human_seconds": [
        116.2,
        126.45
      ],
      "sequence_percent": [
        92,
        90
      ],
      "success_percent": [
        62,
        60
      ],
      "success_CI": [
        [
          48.2,
          74.1
        ],
        [
          46.2,
          72.4
        ]
      ],
      "margin_cm": [
        -0.02,
        0.63
      ],
      "collision_percent": [
        8,
        10
      ]
    },
    {
      "method": "Phase-unaware filtered-H",
      "human_seconds": [
        114.85,
        128.35
      ],
      "sequence_percent": [
        86,
        84
      ],
      "success_percent": [
        62,
        52
      ],
      "success_CI": [
        [
          48.2,
          74.1
        ],
        [
          38.5,
          65.2
        ]
      ],
      "margin_cm": [
        1.05,
        1.54
      ],
      "collision_percent": [
        14,
        16
      ]
    },
    {
      "method": "ACT-Temporal-Disagreement",
      "human_seconds": [
        115.25,
        128.45
      ],
      "sequence_percent": [
        100,
        96
      ],
      "success_percent": [
        82,
        72
      ],
      "success_CI": [
        [
          69.2,
          90.2
        ],
        [
          58.3,
          82.5
        ]
      ],
      "margin_cm": [
        -1.67,
        -0.81
      ],
      "collision_percent": [
        0,
        0
      ]
    },
    {
      "method": "Ensemble-Disagreement",
      "human_seconds": [
        115.85,
        127.65
      ],
      "sequence_percent": [
        98,
        96
      ],
      "success_percent": [
        84,
        68
      ],
      "success_CI": [
        [
          71.5,
          91.7
        ],
        [
          54.2,
          79.2
        ]
      ],
      "margin_cm": [
        -1.8,
        -0.41
      ],
      "collision_percent": [
        0,
        2
      ]
    },
    {
      "method": "MoE-DAgger",
      "human_seconds": [
        112.55,
        127.55
      ],
      "sequence_percent": [
        100,
        98
      ],
      "success_percent": [
        84,
        78
      ],
      "success_CI": [
        [
          71.5,
          91.7
        ],
        [
          64.8,
          87.2
        ]
      ],
      "margin_cm": [
        -1.98,
        -1.13
      ],
      "collision_percent": [
        0,
        0
      ],
      "collision_CI": [
        [
          0,
          7.1
        ],
        [
          0,
          7.1
        ]
      ]
    }
  ]
};
