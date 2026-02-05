import { useState, useEffect } from 'react';
import supabase from '../../utils/supabase.ts';

type RecipeResult = {
  id: number;
  title: string;
  image_url: string;
  created_at: string;
};

export default function RecentRecipe() {
  const [result, setResult] = useState<RecipeResult[] | []>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
          //최근 생성된 레시피 5개 불러오기
          const { data, error } = await supabase
            .from<RecipeResult>('recipes')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
          if (error) {
            throw error;
          }
          setResult(data || []);
      }catch (error) {
        setError('레시피를 불러오는 중 오류가 발생했습니다.');
        console.error('Error fetching recent recipes:', error);
      } finally {
        setLoading(false);
      } 
    })();
  }, [])
if (loading) return <div>로딩중...</div>;
if (error) return <div>{error}</div>;
return (
  <div>
    <h2>최근 생성된 레시피</h2>
    {result.length === 0 ? (
      <p>생성된 레시피가 없습니다.</p>
    ) : (
      <ul>
        {result.map((recipe) => (
          <li key={recipe.id} style={{ marginBottom: '20px' }}>
            <h3>{recipe.title}</h3>
            {recipe.image_url && (
              <img src={recipe.image_url} alt={recipe.title} style={{ maxWidth: '200px' }} />
            )}
            <p>생성일: {new Date(recipe.created_at).toLocaleString()}</p>
            </li>
        ))}
      </ul>
    )}
  </div>
)
}