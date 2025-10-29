import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

// Gemini API 클라이언트 초기화
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 메모 내용 가져오기
    const { content, title } = await request.json()

    // 입력 검증
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '메모 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    // API 키 확인
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // Gemini API를 사용하여 요약 생성
    const prompt = `다음 메모를 간결하고 명확하게 요약해주세요. 핵심 내용을 3-5개의 문장으로 정리해주세요.

제목: ${title || '(제목 없음)'}

내용:
${content}

요약:`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
      config: {
        maxOutputTokens: 500,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    })

    // 응답에서 텍스트 추출
    const summary = response.text

    if (!summary) {
      throw new Error('요약 생성에 실패했습니다.')
    }

    return NextResponse.json({
      summary,
      success: true,
    })
  } catch (error) {
    console.error('Summarization error:', error)
    
    return NextResponse.json(
      {
        error: '요약 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    )
  }
}

