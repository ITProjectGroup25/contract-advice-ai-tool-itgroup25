import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = JSON.parse(
  readFileSync(path.join(__dirname, 'user_stories.json'), 'utf8'),
);
const { epics, user_stories: stories, total_stories } = data;
const allowedRoles = new Set(['Requestor', 'Administrator']);

test('user_stories.json metadata is aligned with catalogue expectations', () => {
  assert.strictEqual(
    stories.length,
    Number(total_stories),
    'total_stories should equal the number of user stories',
  );

  Object.entries(epics).forEach(([epicId, epicName]) => {
    assert.ok(epicName.trim().length > 0, `Epic ${epicId} must have a name`);
    assert.ok(
      stories.some((story) => story.story_id.startsWith(`${epicId}.`)),
      `Epic ${epicId} should have at least one user story`,
    );
  });

  const storyIds = stories.map(story => story.story_id);
  const uniqueIds = new Set(storyIds);
  assert.strictEqual(
    storyIds.length,
    uniqueIds.size,
    'All story IDs should be unique - no duplicate story IDs allowed'
  );
});

stories.forEach((story) => {
  const testName = `US ${story.story_id} – ${story.epic}: ${story.i_want}`;

  test(testName, () => {
    assert.ok(
      /^\d+\.\d+$/.test(story.story_id),
      'Story ID must follow "<epic>.<sequence>" format',
    );

    const [epicId] = story.story_id.split('.');
    assert.strictEqual(
      story.epic,
      epics[epicId],
      'Story epic must align with epics map',
    );

    const personas = story.role
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean);
    assert.ok(personas.length > 0, 'Role must list at least one persona');
    personas.forEach((persona) => {
      assert.ok(
        allowedRoles.has(persona),
        `Unexpected persona "${persona}" encountered`,
      );
    });

    assert.ok(
      story.i_want && story.i_want.trim().length > 0,
      '"i_want" should be present',
    );
    assert.ok(
      story.so_that && story.so_that.trim().length > 0,
      '"so_that" should be present',
    );
    assert.notStrictEqual(
      story.i_want.trim().toLowerCase(),
      story.so_that.trim().toLowerCase(),
      '"i_want" and "so_that" should describe different aspects',
    );

    const numericPriority = Number(story.priority);
    assert.ok(Number.isInteger(numericPriority), 'Priority should be numeric');
    assert.ok(
      numericPriority >= 1 && numericPriority <= 5,
      'Priority should be between 1 and 5',
    );

    if (story.epic.includes('Simple')) {
      assert.ok(
        /simple/i.test(story.i_want),
        'Simple query stories should reference "simple"',
      );
    }

    if (story.epic.includes('Complex')) {
      assert.ok(
        /complex/i.test(story.i_want),
        'Complex referral stories should reference "complex"',
      );
    }

    if (story.epic.includes('Data Reporting')) {
      assert.ok(
        /report|data|sheet/i.test(`${story.i_want} ${story.so_that}`),
        'Data reporting stories should reference reporting concepts',
      );
    }

    if (story.epic.includes('Question Edit')) {
      assert.ok(
        /edit|option|field/i.test(story.i_want),
        'Question edit stories should reference editing actions',
      );
    }
  });
});
