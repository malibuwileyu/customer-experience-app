import { useState } from 'react'
import { useCategories } from '../../hooks/knowledge-base/use-knowledge-base'
import { Input } from '../../components/common/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/common/select'

interface ArticleSearchProps {
  onSearch: (term: string) => void
  onCategoryChange: (categoryId: string | null) => void
  selectedCategory: string | null
}

export function ArticleSearch({ onSearch, onCategoryChange, selectedCategory }: ArticleSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: categories = [] } = useCategories()
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    onSearch(term)
  }

  const handleCategoryChange = (value: string) => {
    onCategoryChange(value === '_all' ? null : value)
  }
  
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <Input
        className="flex-1"
        placeholder="Search articles"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <Select 
        value={selectedCategory || '_all'} 
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All Categories</SelectItem>
          {categories.map(category => (
            <SelectItem key={category.id} value={category.id || '_empty'}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 