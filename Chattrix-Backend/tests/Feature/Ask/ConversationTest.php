<?php

namespace Tests\Feature\Ask;

use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\Document;
use App\Models\DocumentChunk;
use App\Models\User;
use App\Models\Workspace;
use App\Services\Ai\ChatProvider;
use App\Services\Ai\EmbeddingProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use Tests\Support\FakeAiProvider;
use Tests\TestCase;

class ConversationTest extends TestCase
{
    use RefreshDatabase;

    private FakeAiProvider $ai;

    private User $owner;

    private User $member;

    private Workspace $workspace;

    protected function setUp(): void
    {
        parent::setUp();

        $this->ai = new FakeAiProvider;
        $this->ai->topics = ['leave' => 1, 'sick' => 2];
        $this->app->instance(EmbeddingProvider::class, $this->ai);
        $this->app->instance(ChatProvider::class, $this->ai);

        $this->owner = User::factory()->create();
        $this->member = User::factory()->create();
        $this->workspace = Workspace::factory()->ownedBy($this->owner)->withMembers([$this->member])->create();

        $this->chunk('Annual leave is 20 days per year.');
        $this->chunk('Sick leave is 10 days per year.');
    }

    public function test_a_first_question_starts_a_thread_and_saves_both_sides(): void
    {
        $this->ai->reply = ['Annual leave is 20 days [1].'];

        $events = $this->events($this->ask('How much annual leave do I get?'));

        $this->assertSame('conversation', $events[0]['event']);
        $conversation = Conversation::sole();
        $this->assertSame($conversation->id, $events[0]['data']['id']);
        $this->assertSame('How much annual leave do I get?', $conversation->title);
        $this->assertSame($this->member->id, $conversation->user_id);

        [$question, $answer] = $conversation->messages;
        $this->assertSame(ConversationMessage::ROLE_USER, $question->role);
        $this->assertSame('Annual leave is 20 days [1].', $answer->content);
        $this->assertTrue($answer->answered);
        $this->assertSame([1], $answer->cited);
        // Only the cited passage is kept as evidence.
        $this->assertCount(1, $answer->sources);
        $this->assertSame(end($events)['data']['message_id'], $answer->id);
    }

    public function test_the_first_question_is_searched_as_is_without_a_rewrite(): void
    {
        $this->events($this->ask('How much annual leave do I get?'));

        $this->assertSame([], $this->ai->rewrites);
        $this->assertSame(['How much annual leave do I get?'], $this->ai->queries);
    }

    public function test_a_follow_up_is_rewritten_into_a_standalone_question_before_searching(): void
    {
        $this->ai->reply = ['Annual leave is 20 days [1].'];
        $this->events($this->ask('How much annual leave do I get?'));
        $conversation = Conversation::sole();

        $this->ai->rewriteTo = 'How much sick leave do I get?';
        $events = $this->events($this->ask('what about sick?', $conversation->id));

        $this->assertStringContainsString('Employee: How much annual leave do I get?', $this->ai->rewrites[0]);
        $this->assertStringContainsString('Assistant: Annual leave is 20 days .', $this->ai->rewrites[0]);
        $this->assertStringContainsString('Latest message: what about sick?', $this->ai->rewrites[0]);
        $this->assertSame('How much sick leave do I get?', $this->ai->queries[1]);
        $this->assertSame('How much sick leave do I get?', $this->event($events, 'sources')['search_query']);
        $this->assertStringContainsString('Question: How much sick leave do I get?', end($this->ai->prompts)['prompt']);

        $this->assertSame(4, $conversation->messages()->count());
        $this->assertSame('How much sick leave do I get?', $conversation->messages->last()->search_query);
    }

    public function test_the_rewriter_sees_only_the_latest_exchanges_oldest_first(): void
    {
        $conversation = Conversation::factory()->for($this->workspace)->for($this->member)->create();

        foreach (range(1, 5) as $i) {
            ConversationMessage::factory()->for($conversation)->create(['content' => "Question {$i}"]);
            ConversationMessage::factory()->for($conversation)->assistant("Answer {$i}")->create();
        }

        $this->events($this->ask('and that?', $conversation->id));

        $transcript = $this->ai->rewrites[0];
        $this->assertStringNotContainsString('Question 2', $transcript);
        $this->assertLessThan(strpos($transcript, 'Question 5'), strpos($transcript, 'Question 3'));
        $this->assertLessThan(strpos($transcript, 'Latest message'), strpos($transcript, 'Answer 5'));
    }

    public function test_a_failed_rewrite_falls_back_to_the_raw_question(): void
    {
        $this->events($this->ask('How much annual leave do I get?'));
        $this->ai->failRewrite = true;

        $events = $this->events($this->ask('and sick leave?', Conversation::sole()->id));

        $this->assertSame('and sick leave?', $this->ai->queries[1]);
        $this->assertSame('done', end($events)['event']);
    }

    public function test_a_failed_answer_keeps_the_question_but_saves_no_partial_reply(): void
    {
        $this->ai->reply = ['Annual ', 'leave [1].'];
        $this->ai->failChatAfter = 1;

        $events = $this->events($this->ask('How much annual leave do I get?'));

        $this->assertSame('error', end($events)['event']);
        $this->assertSame([ConversationMessage::ROLE_USER], Conversation::sole()->messages->pluck('role')->all());
    }

    public function test_a_colleagues_thread_cannot_be_continued_or_read(): void
    {
        $theirs = Conversation::factory()->for($this->workspace)->for($this->owner)->create();

        Sanctum::actingAs($this->member);

        $this->postJson(route('workspaces.ask', $this->workspace), ['question' => 'Leave?', 'conversation_id' => $theirs->id])->assertNotFound();
        $this->getJson(route('workspaces.conversations.show', [$this->workspace, $theirs]))->assertForbidden();
        $this->deleteJson(route('workspaces.conversations.destroy', [$this->workspace, $theirs]))->assertForbidden();
        $this->assertModelExists($theirs);
    }

    public function test_the_workspace_owner_cannot_read_a_members_thread(): void
    {
        $theirs = Conversation::factory()->for($this->workspace)->for($this->member)->create();

        Sanctum::actingAs($this->owner);

        $this->getJson(route('workspaces.conversations.show', [$this->workspace, $theirs]))->assertForbidden();
        $this->getJson(route('workspaces.conversations.index', $this->workspace))->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_a_thread_from_another_workspace_is_not_found(): void
    {
        $elsewhere = Conversation::factory()->for($this->member)->create();

        Sanctum::actingAs($this->member);

        $this->getJson(route('workspaces.conversations.show', [$this->workspace, $elsewhere]))->assertNotFound();
        $this->postJson(route('workspaces.ask', $this->workspace), ['question' => 'Leave?', 'conversation_id' => $elsewhere->id])->assertNotFound();
    }

    public function test_a_removed_member_loses_their_threads(): void
    {
        $mine = Conversation::factory()->for($this->workspace)->for($this->member)->create();
        $this->workspace->members()->detach($this->member->id);

        Sanctum::actingAs($this->member);

        $this->getJson(route('workspaces.conversations.show', [$this->workspace, $mine]))->assertForbidden();
    }

    public function test_a_member_lists_reads_and_deletes_their_own_threads(): void
    {
        $older = Conversation::factory()->for($this->workspace)->for($this->member)->create(['updated_at' => now()->subDay()]);
        $newer = Conversation::factory()->for($this->workspace)->for($this->member)->create();
        ConversationMessage::factory()->for($newer)->create(['content' => 'How much leave?']);
        ConversationMessage::factory()->for($newer)->assistant()->create();
        Conversation::factory()->for($this->workspace)->for($this->owner)->create();

        Sanctum::actingAs($this->member);

        $this->getJson(route('workspaces.conversations.index', $this->workspace))
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $newer->id);

        $this->getJson(route('workspaces.conversations.show', [$this->workspace, $newer]))
            ->assertOk()
            ->assertJsonCount(2, 'data.messages')
            ->assertJsonPath('data.messages.1.role', 'assistant')
            ->assertJsonPath('data.messages.1.sources.0.page', 2)
            ->assertJsonMissingPath('data.messages.1.usage');

        $this->deleteJson(route('workspaces.conversations.destroy', [$this->workspace, $older]))->assertOk();
        $this->assertModelMissing($older);
    }

    private function ask(string $question, ?int $conversationId = null): TestResponse
    {
        Sanctum::actingAs($this->member);

        return $this->postJson(route('workspaces.ask', $this->workspace), array_filter([
            'question' => $question,
            'conversation_id' => $conversationId,
        ]))->assertOk();
    }

    /**
     * @return list<array{event: string, data: mixed}>
     */
    private function events(TestResponse $response): array
    {
        $events = [];

        foreach (array_filter(explode("\n\n", $response->streamedContent())) as $block) {
            preg_match('/^event: (.+)\ndata: (.*)$/s', $block, $match);
            $events[] = ['event' => $match[1], 'data' => json_decode($match[2], true)];
        }

        return $events;
    }

    /**
     * @param  list<array{event: string, data: mixed}>  $events
     */
    private function event(array $events, string $name): mixed
    {
        return collect($events)->firstWhere('event', $name)['data'];
    }

    private function chunk(string $content): void
    {
        $document = Document::factory()->for($this->workspace)->ready()->create();

        DocumentChunk::factory()->for($document)->create([
            'content' => $content,
            'embedding' => $this->ai->embedQuery($content),
        ]);

        $this->ai->queries = [];
    }
}
