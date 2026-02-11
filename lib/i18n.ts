export type Language = 'en' | 'zh'

export const translations = {
  en: {
    // Header
    header: {
      title: 'RAG-Weaver',
      subtitle: 'Visual Analytics for RAG Pipelines',
      active: 'Active',
      ieee: 'IEEE TVCG'
    },

    // Loading
    loading: {
      session: 'Loading RAG session...'
    },

    // Query Panel
    query: {
      title: 'Query',
      retrieving: 'Retrieving...',
      generating: 'Generating...',
      placeholder: 'Enter question... (Enter to submit)',
      chunks: 'chunks',
      locked: 'locked',
      go: 'Go',
      try: 'Try:',
      examples: [
        'What is the recommended treatment for heart failure?',
        'Are there any drug interactions with warfarin?',
        'What are the side effects of immunotherapy?',
        'How should diabetes be managed?',
        'What are the symptoms of chemotherapy-induced neuropathy?',
        'What are the monitoring requirements for amiodarone?'
      ]
    },

    // Retrieval Results
    retrieval: {
      title: 'Retrieved',
      lock: 'Lock',
      unlock: 'Unlock',
      relevance: 'Relevance'
    },

    // Generated Response
    response: {
      title: 'Response',
      conf: 'conf',
      risk: 'risk',
      src: 'src'
    },

    // View Panels
    views: {
      semanticTerrain: {
        title: 'A: Semantic Terrain',
        subtitle: 'Contour + Voronoi + Lens',
        badge: 'Lens'
      },
      stream: {
        title: 'B: Stream',
        subtitle: 'Relevance',
        badge: 'Lock'
      },
      attentionLoom: {
        title: 'C: Attention Loom',
        subtitle: 'Bipartite attention graph',
        badge: 'Bundle'
      },
      uncertaintyGlyphs: {
        title: 'D: Uncertainty Glyphs',
        subtitle: 'Conflict metrics',
        badge: null
      },
      hypotheticalPlayground: {
        title: 'E: Hypothetical Playground',
        subtitle: 'What-if Sankey paths',
        badge: 'Prune'
      },
      selection: {
        title: 'Selection',
        subtitle: 'Brushing & Linking',
        badge: null
      }
    },

    // Language Switcher
    language: {
      en: 'English',
      zh: '中文'
    },

    // Selection Details
    selectionDetails: {
      selectElement: 'Select an element from any view to see details',
      from: 'From',
      chunk: 'Chunk',
      locked: 'Locked',
      source: 'Source',
      auth: 'Auth',
      relevance: 'Relevance',
      topic: 'Topic',
      generatedSentence: 'Generated Sentence',
      confidence: 'Confidence',
      tokens: 'Tokens',
      hallucinationRisk: 'Halluc. Risk',
      entropy: 'Entropy',
      embeddingPoint: 'Embedding Point',
      cluster: 'Cluster',
      pos: 'Pos',
      density: 'Density',
      relatedItems: '+ {count} related items highlighted'
    }
  },
  zh: {
    // Header
    header: {
      title: 'RAG-Weaver',
      subtitle: 'RAG 管道可视化分析',
      active: '活跃',
      ieee: 'IEEE TVCG'
    },

    // Loading
    loading: {
      session: '正在加载 RAG 会话...'
    },

    // Query Panel
    query: {
      title: '查询',
      retrieving: '检索中...',
      generating: '生成中...',
      placeholder: '输入问题... (Enter 提交)',
      chunks: '片段',
      locked: '锁定',
      go: '提交',
      try: '试试：',
      examples: [
        '心力衰竭的推荐治疗方法是什么？',
        '华法林有什么药物相互作用？',
        '免疫治疗有什么副作用？',
        '应该如何管理糖尿病？',
        '化疗引起的神经病变有哪些症状？',
        '胺碘酮的监测要求是什么？'
      ]
    },

    // Retrieval Results
    retrieval: {
      title: '检索结果',
      lock: '锁定',
      unlock: '解锁',
      relevance: '相关度'
    },

    // Generated Response
    response: {
      title: '生成回复',
      conf: '置信度',
      risk: '风险',
      src: '来源'
    },

    // View Panels
    views: {
      semanticTerrain: {
        title: 'A: 语义地形',
        subtitle: '等高线 + Voronoi + 镜头',
        badge: '镜头'
      },
      stream: {
        title: 'B: 流',
        subtitle: '相关性',
        badge: '锁定'
      },
      attentionLoom: {
        title: 'C: 注意力编织',
        subtitle: '二分注意力图',
        badge: '捆绑'
      },
      uncertaintyGlyphs: {
        title: 'D: 不确定性符号',
        subtitle: '冲突指标',
        badge: null
      },
      hypotheticalPlayground: {
        title: 'E: 假设游乐场',
        subtitle: 'What-if Sankey 路径',
        badge: '修剪'
      },
      selection: {
        title: '选择',
        subtitle: '刷选与联动',
        badge: null
      }
    },

    // Language Switcher
    language: {
      en: 'English',
      zh: '中文'
    },

    // Selection Details
    selectionDetails: {
      selectElement: '从任何视图中选择一个元素以查看详细信息',
      from: '来自',
      chunk: '片段',
      locked: '已锁定',
      source: '来源',
      auth: '权威度',
      relevance: '相关度',
      topic: '主题',
      generatedSentence: '生成句子',
      confidence: '置信度',
      tokens: 'Token',
      hallucinationRisk: '幻觉风险',
      entropy: '熵',
      embeddingPoint: '嵌入点',
      cluster: '聚类',
      pos: '位置',
      density: '密度',
      relatedItems: '+ {count} 个相关项目已高亮'
    }
  }
} as const

export type TranslationKey = typeof translations.en
