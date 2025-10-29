'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { Memo, MemoFormData } from '@/types/memo'

export async function getMemos(): Promise<Memo[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching memos:', error)
    throw new Error('Failed to fetch memos')
  }

  return (data || []).map(memo => ({
    id: memo.id,
    title: memo.title,
    content: memo.content,
    category: memo.category,
    tags: memo.tags,
    createdAt: memo.created_at,
    updatedAt: memo.updated_at,
  }))
}

export async function getMemoById(id: string): Promise<Memo | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching memo:', error)
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    category: data.category,
    tags: data.tags,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function createMemo(formData: MemoFormData): Promise<Memo> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('memos')
    .insert({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating memo:', error)
    throw new Error('Failed to create memo')
  }

  revalidatePath('/')

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    category: data.category,
    tags: data.tags,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function updateMemo(
  id: string,
  formData: MemoFormData
): Promise<Memo> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('memos')
    .update({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating memo:', error)
    throw new Error('Failed to update memo')
  }

  revalidatePath('/')

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    category: data.category,
    tags: data.tags,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function deleteMemo(id: string): Promise<void> {
  const supabase = createServerClient()

  const { error } = await supabase.from('memos').delete().eq('id', id)

  if (error) {
    console.error('Error deleting memo:', error)
    throw new Error('Failed to delete memo')
  }

  revalidatePath('/')
}

export async function clearAllMemos(): Promise<void> {
  const supabase = createServerClient()

  const { error } = await supabase.from('memos').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  if (error) {
    console.error('Error clearing all memos:', error)
    throw new Error('Failed to clear all memos')
  }

  revalidatePath('/')
}

export async function getMemosCount(): Promise<number> {
  const supabase = createServerClient()

  const { count, error } = await supabase
    .from('memos')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error counting memos:', error)
    return 0
  }

  return count || 0
}

