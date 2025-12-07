// Phase 2: Programmatic SEO Pages
// Dynamic pages for public prompt recipes
// These will be generated from user-generated prompts marked as public

import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    slug: string;
  };
}

// Phase 2: This will fetch from Supabase
interface Recipe {
  title: string;
  description?: string;
  prompt: string;
}

async function getRecipe(slug: string): Promise<Recipe | null> {
  // TODO: Query Supabase for public prompt with matching slug
  // Return null if not found
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const recipe = await getRecipe(params.slug);

  if (!recipe) {
    return {
      title: "Prompt Recipe Not Found",
    };
  }

  return {
    title: `${recipe.title} - Viral Vision Prompt Recipe`,
    description: recipe.description || `Learn how to create ${recipe.title} faceless content prompts.`,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      type: "article",
    },
  };
}

export default async function RecipePage({ params }: PageProps) {
  const recipe = await getRecipe(params.slug);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-alabaster p-6">
      <div className="max-w-2xl mx-auto">
        {/* Phase 2: Render recipe content with schema markup */}
        <article className="bg-white rounded-2xl p-8 shadow-lg">
          <h1 className="heading-luxury text-4xl text-mocha mb-4">
            {recipe.title}
          </h1>
          <div className="prose prose-mocha">
            {/* Recipe content will be rendered here */}
          </div>
        </article>
      </div>
    </div>
  );
}

// Phase 2: Generate static paths for SEO
export async function generateStaticParams() {
  // TODO: Fetch all public prompts from Supabase
  // Return array of slugs for static generation
  return [];
}

