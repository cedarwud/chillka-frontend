'use client';

import { createQuestion } from '@action/activity';
import { Button } from '@components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { toast } from '@components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { userCommentSchema } from '@lib/definitions';
import cn from '@lib/utils';
import { useActivityContext } from '@store/ActivityProvider/ActivityProvider';
import { Send } from 'lucide-react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type CommentProps = {
  className: string;
  action: 'comment' | 'reply';
  questionId: string;
};

const Comment = ({ className, action, questionId }: CommentProps) => {
  const [isPending, startTransition] = useTransition();
  const { data, loadActivity } = useActivityContext();

  const form = useForm<z.output<typeof userCommentSchema>>({
    resolver: zodResolver(userCommentSchema),
    defaultValues: {
      content: '',
    },
  });

  if (!data) {
    return null;
  }

  const handleSubmitComment = form.handleSubmit((formValue) => {
    startTransition(async () => {
      const type = action === 'comment' ? '提問' : '回覆';
      const result = await createQuestion(
        type,
        data.activity._id,
        formValue,
        questionId
      );
      if (result?.message !== '') {
        toast({
          title: result?.message ?? 'Unknown error',
          variant: result?.status === 'success' ? 'default' : 'destructive',
        });
      }
      if (result?.status === 'success') {
        loadActivity(data.activity._id);
        form.reset();
      }
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitComment} className={cn('w-full', className)}>
        <div className="flex grow border px-4 py-2">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="grow">
                <FormControl>
                  <Input
                    className="border-none p-0 placeholder:text-base placeholder:text-primary focus-visible:ring-0"
                    placeholder={
                      action === 'comment'
                        ? '您可以在此處提出任何關於活動的疑問或需求'
                        : '新增回覆'
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="ml-2 p-2 text-primary transition-colors hover:bg-transparent hover:text-primary/70 xl:ml-[0.625rem]"
            variant="ghost"
            disabled={isPending}
          >
            <Send size={24} />
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default Comment;
