import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '../components/shared';
import { useLandingContent, landingKeys } from '../../landing/hooks/useLandingContent';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  Star,
  GripVertical,
  User,
} from 'lucide-react';
import type {
  HeroContent,
  TrustBarContent,
  ProgramsContent,
  TestimonialsContent,
  FAQContent,
  HowItWorksContent,
  ProblemSolutionContent,
  BookingCTAContent,
  FooterContent,
} from '../../landing/types/landing.types';
import { cmsService, type FeaturedTeacher } from '../services/cms.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type Tab = 'hero' | 'trust-bar' | 'programs' | 'testimonials' | 'teachers' | 'faq' | 'how-it-works' | 'problem-solution' | 'booking-cta' | 'footer';

const TABS: { value: Tab; label: string }[] = [
  { value: 'hero', label: 'Hero' },
  { value: 'trust-bar', label: 'Trust Bar' },
  { value: 'how-it-works', label: 'How It Works' },
  { value: 'problem-solution', label: 'Problem/Solution' },
  { value: 'programs', label: 'Programs' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'teachers', label: 'Teachers' },
  { value: 'booking-cta', label: 'Booking CTA' },
  { value: 'faq', label: 'FAQ' },
  { value: 'footer', label: 'Footer' },
];

export const CMSPage = () => {
  const queryClient = useQueryClient();
  const { data: content, isLoading } = useLandingContent();
  const [activeTab, setActiveTab] = useState<Tab>('hero');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500">Loading content...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Failed to load content</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Landing Page Content"
        subtitle="Changes go live immediately after saving."
      />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${
                  activeTab === tab.value
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'hero' && (
          <HeroTab content={content.hero} onSuccess={() => queryClient.invalidateQueries({ queryKey: landingKeys.content() })} />
        )}
        {activeTab === 'trust-bar' && (
          <TrustBarTab content={content.trust_bar} onSuccess={() => queryClient.invalidateQueries({ queryKey: landingKeys.content() })} />
        )}
        {activeTab === 'how-it-works' && (
          <HowItWorksTab content={content.how_it_works} onSuccess={() => queryClient.invalidateQueries({ queryKey: landingKeys.content() })} />
        )}
        {activeTab === 'problem-solution' && (
          <ProblemSolutionTab content={content.problem_solution} onSuccess={() => queryClient.invalidateQueries({ queryKey: landingKeys.content() })} />
        )}
        {activeTab === 'programs' && (
          <ProgramsTab content={content.programs} onSuccess={() => queryClient.invalidateQueries({ queryKey: landingKeys.content() })} />
        )}
        {activeTab === 'testimonials' && (
          <TestimonialsTab content={content.testimonials} onSuccess={() => queryClient.invalidateQueries({ queryKey: landingKeys.content() })} />
        )}
        {activeTab === 'teachers' && (
          <TeachersTab onSuccess={() => queryClient.invalidateQueries({ queryKey: landingKeys.content() })} />
        )}
        {activeTab === 'booking-cta' && (
          <BookingCTATab content={content.booking_cta} onSuccess={() => queryClient.invalidateQueries({ queryKey: landingKeys.content() })} />
        )}
        {activeTab === 'faq' && (
          <FAQTab content={content.faq} onSuccess={() => queryClient.invalidateQueries({ queryKey: landingKeys.content() })} />
        )}
        {activeTab === 'footer' && (
          <FooterTab content={content.footer} onSuccess={() => queryClient.invalidateQueries({ queryKey: landingKeys.content() })} />
        )}
      </div>
    </div>
  );
};

// Hero Tab Component
interface HeroTabProps {
  content: HeroContent;
  onSuccess: () => void;
}

const HeroTab = ({ content, onSuccess }: HeroTabProps) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      headline: content.headline,
      subheadline: content.subheadline,
      ctaText: content.ctaText,
      ctaSubtext: content.ctaSubtext,
      stats: content.stats,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await cmsService.updateHero(data);
      toast.success('Hero content saved successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.error?.message || 'Failed to save hero content');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h2>

      <div className="space-y-4">
        <Input label="Headline" {...register('headline')} fullWidth />

        <Input label="Subheadline" {...register('subheadline')} fullWidth />

        <Input label="CTA Text" {...register('ctaText')} fullWidth />

        <Input label="CTA Subtext" {...register('ctaSubtext')} fullWidth />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Stats</label>
          <div className="space-y-3">
            {content.stats.map((_, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-1">
                  <Input
                    label={`Stat ${index + 1} Value`}
                    {...register(`stats.${index}.value`)}
                    fullWidth
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label={`Stat ${index + 1} Label`}
                    {...register(`stats.${index}.label`)}
                    fullWidth
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" leftIcon={<Save size={18} />}>
          Save Hero
        </Button>
      </div>
    </form>
  );
};

// Trust Bar Tab Component
interface TrustBarTabProps {
  content: TrustBarContent;
  onSuccess: () => void;
}

const TrustBarTab = ({ content, onSuccess }: TrustBarTabProps) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      items: content.items,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await cmsService.updateTrustBar(data);
      toast.success('Trust bar saved successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.error?.message || 'Failed to save trust bar');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Trust Bar</h2>

      <div className="space-y-3">
        {content.items.map((_, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex-1">
              <Input
                label={`Item ${index + 1} Icon`}
                {...register(`items.${index}.icon`)}
                fullWidth
              />
            </div>
            <div className="flex-[2]">
              <Input
                label={`Item ${index + 1} Text`}
                {...register(`items.${index}.text`)}
                fullWidth
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" leftIcon={<Save size={18} />}>
          Save Trust Bar
        </Button>
      </div>
    </form>
  );
};

// Programs Tab Component
interface ProgramsTabProps {
  content: ProgramsContent;
  onSuccess: () => void;
}

const ProgramsTab = ({ content, onSuccess }: ProgramsTabProps) => {
  const [openPackages, setOpenPackages] = useState<Record<number, boolean>>({
    0: true,
  });

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      packages: content.packages,
      addOn: content.addOn,
      discounts: content.discounts,
    },
  });

  const packages = watch('packages');

  const togglePackage = (index: number) => {
    setOpenPackages((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const onSubmit = async (data: any) => {
    try {
      await cmsService.updatePrograms(data);
      toast.success('Programs saved successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.error?.message || 'Failed to save programs');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-800">Price changes are live immediately</p>
          <p className="text-sm text-amber-700 mt-1">
            Any changes to pricing will be reflected on the landing page as soon as you save.
          </p>
        </div>
      </div>

      {/* Packages */}
      {packages.map((pkg: any, index: number) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <button
            type="button"
            onClick={() => togglePackage(index)}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-semibold text-gray-900">{pkg.name}</span>
            {openPackages[index] ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {openPackages[index] && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price"
                  type="number"
                  {...register(`packages.${index}.price`, { valueAsNumber: true })}
                  fullWidth
                />
                <Input
                  label="Sessions"
                  type="number"
                  {...register(`packages.${index}.sessions`, { valueAsNumber: true })}
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Features (one per line)
                </label>
                <textarea
                  {...register(`packages.${index}.features`)}
                  className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add-on */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Add-on Sessions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price"
            type="number"
            {...register('addOn.price', { valueAsNumber: true })}
            fullWidth
          />
          <Input
            label="Sessions"
            type="number"
            {...register('addOn.sessions', { valueAsNumber: true })}
            fullWidth
          />
        </div>
        <div className="mt-4">
          <Input
            label="Description"
            {...register('addOn.description')}
            fullWidth
          />
        </div>
      </div>

      {/* Discounts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Discounts</h3>
        <div className="grid grid-cols-2 gap-4">
          {content.discounts.map((_, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-1">
                <Input
                  label={`Discount ${index + 1} Label`}
                  {...register(`discounts.${index}.label`)}
                  fullWidth
                />
              </div>
              <div className="flex-1">
                <Input
                  label={`Discount ${index + 1} Value`}
                  {...register(`discounts.${index}.value`)}
                  fullWidth
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" leftIcon={<Save size={18} />}>
          Save Programs
        </Button>
      </div>
    </form>
  );
};

// Testimonials Tab Component
interface TestimonialsTabProps {
  content: TestimonialsContent;
  onSuccess: () => void;
}

const TestimonialsTab = ({ content, onSuccess }: TestimonialsTabProps) => {
  const [items, setItems] = useState(content.items);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      items,
    },
  });

  const addTestimonial = () => {
    setItems([
      ...items,
      {
        name: '',
        country: '',
        sex: 'male' as const,
        rating: 5,
        package: '',
        text: '',
        photoUrl: '',
      },
    ]);
  };

  const removeTestimonial = (index: number) => {
    if (items.length <= 1) {
      toast.error('At least one testimonial is required');
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const onSubmit = async (data: any) => {
    try {
      await cmsService.updateTestimonials({ items: data.items });
      toast.success('Testimonials saved successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.error?.message || 'Failed to save testimonials');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {items.map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Testimonial {index + 1}</h3>
            <button
              type="button"
              onClick={() => removeTestimonial(index)}
              className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
            >
              <Trash2 size={16} />
              Remove
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              {...register(`items.${index}.name`)}
              fullWidth
            />
            <Input
              label="Country"
              {...register(`items.${index}.country`)}
              fullWidth
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Sex
              </label>
              <select
                {...register(`items.${index}.sex`)}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Rating (1-5)
              </label>
              <select
                {...register(`items.${index}.rating`, { valueAsNumber: true })}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="col-span-2">
              <Input
                label="Photo URL (optional)"
                placeholder="https://example.com/photo.jpg"
                {...register(`items.${index}.photoUrl`)}
                fullWidth
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported: Unsplash, Cloudinary, Imgur, Pexels, Pixabay. Leave empty for default.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Input
              label="Package"
              {...register(`items.${index}.package`)}
              fullWidth
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Testimonial Text
            </label>
            <textarea
              {...register(`items.${index}.text`)}
              className="w-full min-h-[100px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addTestimonial}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Add Testimonial
      </button>

      <div className="flex justify-end">
        <Button type="submit" leftIcon={<Save size={18} />}>
          Save Testimonials
        </Button>
      </div>
    </form>
  );
};

// FAQ Tab Component
interface FAQTabProps {
  content: FAQContent;
  onSuccess: () => void;
}

const FAQTab = ({ content, onSuccess }: FAQTabProps) => {
  const [items, setItems] = useState(content.items);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      items,
    },
  });

  const addFAQ = () => {
    setItems([...items, { q: '', a: '' }]);
  };

  const removeFAQ = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const onSubmit = async (data: any) => {
    try {
      await cmsService.updateFAQ({ items: data.items });
      toast.success('FAQ saved successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.error?.message || 'Failed to save FAQ');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {items.map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">FAQ Item {index + 1}</h3>
            <button
              type="button"
              onClick={() => removeFAQ(index)}
              className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
            >
              <Trash2 size={16} />
              Remove
            </button>
          </div>

          <div className="space-y-4">
            <Input
              label="Question"
              {...register(`items.${index}.q`)}
              fullWidth
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Answer
              </label>
              <textarea
                {...register(`items.${index}.a`)}
                className="w-full min-h-[100px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addFAQ}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Add FAQ Item
      </button>

      <div className="flex justify-end">
        <Button type="submit" leftIcon={<Save size={18} />}>
          Save FAQ
        </Button>
      </div>
    </form>
  );
};

// Teachers Tab Component - Manage featured teachers on landing page
interface TeachersTabProps {
  onSuccess: () => void;
}

const TeachersTab = ({ onSuccess }: TeachersTabProps) => {
  const { data: teachersData, isLoading } = useQuery<{ data?: FeaturedTeacher[] } | FeaturedTeacher[]>({
    queryKey: ['admin-teachers-featured'],
    queryFn: () => cmsService.getAllTeachersForFeatured(),
  });

  // Handle different response formats
  const teachers: FeaturedTeacher[] = Array.isArray(teachersData)
    ? teachersData
    : (teachersData?.data || []);

  const [editingLandingBio, setEditingLandingBio] = useState<string | null>(null);
  const [landingBioText, setLandingBioText] = useState('');

  const toggleFeatured = async (teacherId: string, currentStatus: boolean, order?: number) => {
    try {
      await cmsService.updateTeacherFeatured(teacherId, {
        isFeatured: !currentStatus,
        featuredOrder: !currentStatus ? (order ?? 0) : undefined,
      });
      toast.success(`Teacher ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.error?.message || 'Failed to update teacher');
    }
  };

  const saveLandingBio = async (teacherId: string) => {
    try {
      await cmsService.updateTeacherFeatured(teacherId, {
        isFeatured: true,
        landingBio: landingBioText,
      });
      toast.success('Landing bio updated successfully');
      setEditingLandingBio(null);
      setLandingBioText('');
      onSuccess();
    } catch (error: any) {
      toast.error(error.error?.message || 'Failed to update bio');
    }
  };

  const featuredTeachers = teachers.filter((t) => t.isFeatured);
  const availableTeachers = teachers.filter((t) => !t.isFeatured && t.isActive);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500">Loading teachers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Featured Teachers Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-secondary fill-secondary" />
          Featured Teachers (shown on landing page)
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          These teachers will be displayed on the landing page in the order shown below.
          Maximum 6 teachers can be featured.
        </p>

        {featuredTeachers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            No featured teachers yet. Select teachers from the list below to feature them.
          </div>
        ) : (
          <div className="space-y-3">
            {featuredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg"
              >
                <GripVertical className="w-5 h-5 text-gray-400" />
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {teacher.profilePictureUrl ? (
                    <img
                      src={teacher.profilePictureUrl}
                      alt={teacher.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                      <User size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{teacher.fullName}</p>
                    <span className="text-xs px-2 py-0.5 bg-secondary text-white rounded-full">
                      {teacher.sex}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {teacher.specializations?.join(', ') || 'No specializations'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Rating: {Number(teacher.rating).toFixed(1)}/5
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingLandingBio(teacher.id)}
                  >
                    Edit Bio
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFeatured(teacher.id, true)}
                  >
                    Unfeature
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Landing Bio Editor Modal/Inline */}
      {editingLandingBio && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Edit Landing Page Bio</h4>
          <textarea
            value={landingBioText}
            onChange={(e) => setLandingBioText(e.target.value)}
            placeholder="Enter a short bio for the landing page (max 200 characters)..."
            className="w-full min-h-[100px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary mb-4"
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mb-4">
            This bio will be shown on the landing page carousel. Leave empty to use the teacher's regular bio.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => saveLandingBio(editingLandingBio)}>Save Bio</Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingLandingBio(null);
                setLandingBioText('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Available Teachers Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">All Teachers</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select teachers to feature on the landing page.
        </p>

        {availableTeachers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No more teachers available to feature.
          </div>
        ) : (
          <div className="space-y-3">
            {availableTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {teacher.profilePictureUrl ? (
                    <img
                      src={teacher.profilePictureUrl}
                      alt={teacher.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                      <User size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{teacher.fullName}</p>
                    {!teacher.isActive && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                        Inactive
                      </span>
                    )}
                    {!teacher.isAvailable && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {teacher.specializations?.slice(0, 2).join(', ') || 'No specializations'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Rating: {Number(teacher.rating).toFixed(1)}/5 · {teacher.totalStudents} students
                  </p>
                  {teacher.landingBio && (
                    <p className="text-xs text-primary mt-1 truncate">
                      "{teacher.landingBio}"
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => toggleFeatured(teacher.id, false, featuredTeachers.length)}
                  disabled={!teacher.isActive || featuredTeachers.length >= 6}
                >
                  Feature
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// How It Works Tab Component
interface HowItWorksTabProps {
  content?: HowItWorksContent;
  onSuccess: () => void;
}

const HowItWorksTab = ({ content, onSuccess }: HowItWorksTabProps) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      headline: content?.headline || '',
      subheadline: content?.subheadline || '',
      steps: content?.steps || [
        { icon: 'book-open', number: 1, title: '', description: '' },
        { icon: 'user-check', number: 2, title: '', description: '' },
        { icon: 'video', number: 3, title: '', description: '' },
      ],
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await cmsService.updateSection('how_it_works', data);
      toast.success('How It Works content saved successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.error?.message || 'Failed to save content');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works Section</h2>

      <div className="space-y-4">
        <Input label="Headline" {...register('headline')} fullWidth />
        <Input label="Subheadline" {...register('subheadline')} fullWidth />

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Steps</label>
          <div className="space-y-4">
            {(content?.steps || [1, 2, 3]).map((_, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <h4 className="font-medium text-gray-900">Step {index + 1}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Icon (lucide name)" {...register(`steps.${index}.icon`)} fullWidth />
                  <Input label="Number" type="number" {...register(`steps.${index}.number`, { valueAsNumber: true })} fullWidth />
                </div>
                <Input label="Title" {...register(`steps.${index}.title`)} fullWidth />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea {...register(`steps.${index}.description`)} className="w-full min-h-[80px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" leftIcon={<Save size={18} />}>Save How It Works</Button>
      </div>
    </form>
  );
};

// Problem/Solution Tab Component
interface ProblemSolutionTabProps {
  content?: ProblemSolutionContent;
  onSuccess: () => void;
}

const ProblemSolutionTab = ({ content, onSuccess }: ProblemSolutionTabProps) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      problemHeadline: content?.problemHeadline || '',
      problemSubheadline: content?.problemSubheadline || '',
      problems: content?.problems || ['', '', '', '', ''],
      solutionHeadline: content?.solutionHeadline || '',
      solutionSubheadline: content?.solutionSubheadline || '',
      solutions: content?.solutions || ['', '', '', '', ''],
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await cmsService.updateSection('problem_solution', data);
      toast.success('Problem/Solution content saved successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.error?.message || 'Failed to save content');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Problem Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-red-600 mb-4">Problems</h3>
        <div className="space-y-4">
          <Input label="Problem Headline" {...register('problemHeadline')} fullWidth />
          <Input label="Problem Subheadline" {...register('problemSubheadline')} fullWidth />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Problem Points</label>
            <div className="space-y-2">
              {(content?.problems || [1, 2, 3, 4, 5]).map((_, index) => (
                <Input key={index} label={`Problem ${index + 1}`} {...register(`problems.${index}`)} fullWidth />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-primary mb-4">Solutions</h3>
        <div className="space-y-4">
          <Input label="Solution Headline" {...register('solutionHeadline')} fullWidth />
          <Input label="Solution Subheadline" {...register('solutionSubheadline')} fullWidth />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Solution Points</label>
            <div className="space-y-2">
              {(content?.solutions || [1, 2, 3, 4, 5]).map((_, index) => (
                <Input key={index} label={`Solution ${index + 1}`} {...register(`solutions.${index}`)} fullWidth />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" leftIcon={<Save size={18} />}>Save Problem/Solution</Button>
      </div>
    </form>
  );
};

// Booking CTA Tab Component
interface BookingCTATabProps {
  content?: BookingCTAContent;
  onSuccess: () => void;
}

const BookingCTATab = ({ content, onSuccess }: BookingCTATabProps) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      headline: content?.headline || '',
      subheadline: content?.subheadline || '',
      rating: content?.rating || '',
      buttonText: content?.buttonText || '',
      trustText: content?.trustText || '',
      features: content?.features || [
        { icon: 'calendar', text: '' },
        { icon: 'clock', text: '' },
        { icon: 'shield-check', text: '' },
      ],
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await cmsService.updateSection('booking_cta', data);
      toast.success('Booking CTA content saved successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.error?.message || 'Failed to save content');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking CTA Section</h2>

      <div className="space-y-4">
        <Input label="Headline" {...register('headline')} fullWidth />
        <Input label="Subheadline" {...register('subheadline')} fullWidth />
        <Input label="Rating Text" {...register('rating')} fullWidth />
        <Input label="Button Text" {...register('buttonText')} fullWidth />
        <Input label="Trust Text" {...register('trustText')} fullWidth />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Features</label>
          <div className="space-y-3">
            {(content?.features || [1, 2, 3]).map((_, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-1">
                  <Input label={`Feature ${index + 1} Icon`} {...register(`features.${index}.icon`)} fullWidth />
                </div>
                <div className="flex-[2]">
                  <Input label={`Feature ${index + 1} Text`} {...register(`features.${index}.text`)} fullWidth />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" leftIcon={<Save size={18} />}>Save Booking CTA</Button>
      </div>
    </form>
  );
};

// Footer Tab Component
interface FooterTabProps {
  content?: FooterContent;
  onSuccess: () => void;
}

const FooterTab = ({ content, onSuccess }: FooterTabProps) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      brandName: content?.brandName || '',
      brandDescription: content?.brandDescription || '',
      contactEmail: content?.contactEmail || '',
      contactLocation: content?.contactLocation || '',
      programLinks: content?.programLinks || [
        { name: '', href: '' },
        { name: '', href: '' },
        { name: '', href: '' },
        { name: '', href: '' },
      ],
      companyLinks: content?.companyLinks || [
        { name: '', href: '' },
        { name: '', href: '' },
        { name: '', href: '' },
        { name: '', href: '' },
      ],
      socialLinks: content?.socialLinks || {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: '',
      },
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await cmsService.updateSection('footer', data);
      toast.success('Footer content saved successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.error?.message || 'Failed to save content');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Footer Section</h2>

      <div className="space-y-6">
        <Input label="Brand Name" {...register('brandName')} fullWidth />
        <Input label="Brand Description" {...register('brandDescription')} fullWidth />
        <Input label="Contact Email" {...register('contactEmail')} fullWidth />
        <Input label="Contact Location" {...register('contactLocation')} fullWidth />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Program Links</label>
          <div className="space-y-2">
            {(content?.programLinks || [1, 2, 3, 4]).map((_, index) => (
              <div key={index} className="grid grid-cols-2 gap-3">
                <Input label={`Program ${index + 1} Name`} {...register(`programLinks.${index}.name`)} fullWidth />
                <Input label={`Program ${index + 1} Link`} {...register(`programLinks.${index}.href`)} fullWidth />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Company Links</label>
          <div className="space-y-2">
            {(content?.companyLinks || [1, 2, 3, 4]).map((_, index) => (
              <div key={index} className="grid grid-cols-2 gap-3">
                <Input label={`Link ${index + 1} Name`} {...register(`companyLinks.${index}.name`)} fullWidth />
                <Input label={`Link ${index + 1} URL`} {...register(`companyLinks.${index}.href`)} fullWidth />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Social Links</label>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Facebook URL" {...register('socialLinks.facebook')} fullWidth />
            <Input label="Instagram URL" {...register('socialLinks.instagram')} fullWidth />
            <Input label="Twitter URL" {...register('socialLinks.twitter')} fullWidth />
            <Input label="YouTube URL" {...register('socialLinks.youtube')} fullWidth />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" leftIcon={<Save size={18} />}>Save Footer</Button>
      </div>
    </form>
  );
};
